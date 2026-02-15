
import json
import os
import sys
import time
from datetime import datetime
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

# River.go.jp Realtime Data Fetcher (V3 - Efficient)
# Strategy:
# 1. Load data/kawabou_dam_master.json (Map obsFcd -> Name)
# 2. Iterate all 47 prefectures using OBSLIST endpoint (Fast, No timestamp needed)
#    URL: https://www.river.go.jp/kawabou/file/files/obslist/twninfo/tm/dam/{PREF_CODE}.json
# 3. Match real-time data (obsFcd) -> Name -> data/dams.json ID
# 4. Update data/realtime.json

BASE_URL_OBSLIST = "https://www.river.go.jp/kawabou/file/files/obslist/twninfo/tm/dam"
MASTER_DAM_MAP_JSON = os.path.join("data", "kawabou_dam_master.json")
OUTPUT_REALTIME_JSON = os.path.join("data", "realtime.json")
MY_DAMS_JSON = os.path.join("data", "dams.json")

def fetch_json(url):
    try:
        req = Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })
        with urlopen(req) as response:
            if response.status == 200:
                return json.loads(response.read().decode('utf-8'))
    except (URLError, HTTPError) as e:
        # print(f"Failed to fetch {url}: {e}")
        pass
    return None

def clean_name(n):
    if not n: return ""
    return n.replace(" ", "").replace("　", "")

def main():
    print("Starting Fetch Realtime V3...")
    
    # 1. Load Maps
    if not os.path.exists(MASTER_DAM_MAP_JSON):
        print(f"Error: {MASTER_DAM_MAP_JSON} not found. Run fetch_kawabou_master_v2.py first.")
        sys.exit(1)
        
    with open(MASTER_DAM_MAP_JSON, 'r', encoding='utf-8') as f:
        kawabou_master = json.load(f)["dams"] # obsFcd -> details
        
    with open(MY_DAMS_JSON, 'r', encoding='utf-8') as f:
        my_dams = json.load(f)["dams"]
        
    # Build a lookup for My Dams:  CleanName -> ID
    my_dam_lookup = {}
    my_dam_ids_set = set()
    id_to_capacity = {}
    
    # Manual name aliases: Master name -> My name (for name mismatches)
    NAME_ALIASES = {
        "新桂沢ダム": "桂沢ダム",  # Hokkaido: Master uses 新桂沢, dams.json uses 桂沢
        "栗駒ダム（利水）": "栗駒ダム",  # Miyagi: GeoJSON has 利水 suffix
    }
    
    for d in my_dams:
        clean = clean_name(d["name"])
        my_dam_lookup[clean] = d["id"]
        my_dam_ids_set.add(d["id"])
        # Store effective capacity (m3)
        if "effectiveCapacity" in d and d["effectiveCapacity"]:
             id_to_capacity[d["id"]] = d["effectiveCapacity"]
             
    print(f"Loaded {len(kawabou_master)} Kawabou dams and {len(my_dams)} target dams.")
    
    # 2. Fetch Realtime Data from all Prefectures + Hokkaido sub-regions
    realtime_data_map = {} # obsFcd -> { rate, stg, ... }
    
    # Standard prefectures use codes like "0201", "0301", ..., "4701"
    # Hokkaido uses special region codes: 102 (道北), 103 (道東), 104 (道央), 105 (道南)
    pref_codes = [f"{i:02}01" for i in range(2, 48)]  # Skip 01 (Hokkaido standard - 404)
    pref_codes += ["102", "103", "104", "105"]        # Add Hokkaido sub-regions
    
    print(f"Fetching realtime data from {len(pref_codes)} regions (46 prefs + 4 Hokkaido sub-regions)...")
    for idx, pref_code in enumerate(pref_codes):
        url = f"{BASE_URL_OBSLIST}/{pref_code}.json"
        
        data = fetch_json(url)
        if data and "prefTwn" in data:
            for twn in data["prefTwn"]:
                if "dam" in twn:
                    for d in twn["dam"]:
                        obs_fcd = d.get("obsFcd")
                        # OBSLIST obsName is often empty. Use Master to get name.
                        master_info = kawabou_master.get(obs_fcd)
                        if not master_info:
                             continue
                             
                        raw_name = master_info.get("name", "")
                        clean_n = clean_name(raw_name)
                        
                        # Check name aliases first
                        alias_name = NAME_ALIASES.get(clean_n)
                        if alias_name:
                            clean_n = clean_name(alias_name)
                        
                        # Strip common suffixes: (機構), （機構）
                        stripped_n = clean_n.replace("(機構)", "").replace("（機構）", "").strip()
                        
                        # Match to My IDs (try full name first, then stripped)
                        my_id = my_dam_lookup.get(clean_n) or my_dam_lookup.get(stripped_n)
                        
                        # Fuzzy Match: Try matching by removing/checking suffixes if not found
                        if not my_id:
                            for my_name, mid in my_dam_lookup.items():
                                if clean_n.startswith(my_name) and clean_n != my_name:
                                    # print(f"Fuzzy Match: {clean_n} -> {my_name} ({mid})")
                                    my_id = mid
                                    break
                        
                        if my_id:
                            # Found a match!
                            
                            if obs_fcd == "2255200700004":
                                print(f"DEBUG: Sameura fields: {d}")
                            
                            # Universal Data Consistency: Check Irrigation rate first for ALL dams
                            # Then Effective, then calculate later if needed.
                            rate = d.get("storPcntIrr")
                            if rate is None:
                                rate = d.get("storPcntEff")
                                
                            realtime_data_map[my_id] = {  # Store by My ID
                                "rate": rate,
                                "level": d.get("storLvl"),
                                "inflow": d.get("allSink"),
                                "outflow": d.get("allDisch"),
                                "capacity": d.get("storCap"),
                                "updatedAt": d.get("obsTime")
                            }
        
        if (idx + 1) % 10 == 0: print(f"  Scanned {idx + 1}/{len(pref_codes)} regions...")
        time.sleep(0.05)
        
    obslist_count = len(realtime_data_map)
    print(f"Phase 1 (OBSLIST): Collected realtime data for {obslist_count} dams.")
    
    # 2b. Phase 2: Fetch non-OBSLIST dams via GeoJSON + tmlist
    # Some dams (e.g. Miyagi prefectural dams, Yamagata dams) have rate data on Kawabou
    # but aren't included in the standard OBSLIST API. They appear in the GeoJSON map layer.
    now = datetime.now()
    date_str = now.strftime('%Y%m%d')
    minute = ((now.minute - 5) // 5) * 5
    if minute < 0: minute = 55
    time_str = f"{now.hour:02d}{minute:02d}"
    
    # Collect all obs_fcds already found in OBSLIST
    obslist_matched_ids = set(realtime_data_map.keys())
    
    # Scan GeoJSON for each prefecture to find additional dams
    print(f"Phase 2: Scanning GeoJSON for non-OBSLIST dams...")
    geojson_extra = {}  # obs_fcd -> {name, lat, lon}
    for pc in range(101, 4702, 100):
        url = f"https://www.river.go.jp/kawabou/file/gjson/obs/{date_str}/{time_str}/dam/{pc}.json"
        data = fetch_json(url)
        if data and 'features' in data:
            for f in data['features']:
                p = f.get('properties', {})
                obs_fcd = p.get('obs_fcd', '')
                if obs_fcd:
                    dam_name = p.get('obs_nm', '')
                    if dam_name:
                        geojson_extra[obs_fcd] = {
                            'name': dam_name,
                            'lat': p.get('lat'),
                            'lon': p.get('lon'),
                        }
        time.sleep(0.02)
    
    # For each extra dam, try to match to my_dam_lookup and fetch tmlist
    extra_matched = 0
    for obs_fcd, info in geojson_extra.items():
        dam_name = info['name']
        clean_n = clean_name(dam_name)
        
        # Strip suffixes
        stripped_n = clean_n.replace("(機構)", "").replace("（機構）", "")
        stripped_n = stripped_n.replace("（利水）", "").replace("(利水)", "").strip()
        
        # Check aliases
        alias_name = NAME_ALIASES.get(clean_n) or NAME_ALIASES.get(stripped_n)
        if alias_name:
            clean_n = clean_name(alias_name)
            stripped_n = clean_n
        
        my_id = my_dam_lookup.get(clean_n) or my_dam_lookup.get(stripped_n)
        
        # Fuzzy match
        if not my_id:
            for my_name, mid in my_dam_lookup.items():
                if clean_n.startswith(my_name) and clean_n != my_name:
                    my_id = mid
                    break
        
        if my_id and my_id not in realtime_data_map:
            # Fetch tmlist for this dam
            tmlist_url = f"https://www.river.go.jp/kawabou/file/files/tmlist/dam/{date_str}/{time_str}/{obs_fcd}.json"
            tm_data = fetch_json(tmlist_url)
            if tm_data and isinstance(tm_data, dict):
                ov = tm_data.get('obsValue')
                if ov:
                    rate = ov.get('storPcntIrr')
                    if rate is None:
                        rate = ov.get('storPcntEff')
                    realtime_data_map[my_id] = {
                        "rate": rate,
                        "level": ov.get("storLvl"),
                        "inflow": ov.get("allSink"),
                        "outflow": ov.get("allDisch"),
                        "capacity": ov.get("storCap"),
                        "updatedAt": ov.get("obsTime")
                    }
                    extra_matched += 1
            time.sleep(0.03)
    
    phase2_total = len(realtime_data_map) - obslist_count
    print(f"Phase 2 (GeoJSON+tmlist): Found {len(geojson_extra)} extra dams, matched {extra_matched} new.")
    print(f"Total collected: {len(realtime_data_map)} dams.")
    
    # 3. Match and Update
    realtime_output = {"_timestamp": datetime.now().isoformat()}
    matched_count = 0
    
    for dam_id in my_dam_lookup.values(): # Initialize all with None
        realtime_output[dam_id] = {
            "rate": None, "level": None, "inflow": None, "outflow": None, "updatedAt": None
        }

    # 3. Match and Update
    # realtime_data_map is now keyed by MyDamID (e.g. d008, d022)
    for dam_id, rt in realtime_data_map.items():
        if dam_id in realtime_output:
            # Approximate calculation if rate is missing
            if rt["rate"] is None and rt["capacity"] is not None:
                # rt["capacity"] is usually 1000m3 unit?
                # Kawabou 'storCap' unit varies. Usually it is 1000m3.
                # Let's assume 1000m3 for now as per previous logic.
                 
                # Find dam capacity from my_dams (using id_to_capacity)
                if dam_id in id_to_capacity:
                    eff_cap = id_to_capacity[dam_id]
                    if eff_cap > 0:
                        try:
                            # 1000m3 -> m3
                            current_vol_m3 = float(rt["capacity"]) * 1000
                            approx_rate = (current_vol_m3 / eff_cap) * 100
                            
                            # Sanity check: if > 120%, maybe unit is different (e.g. m3)
                            # taking conservative approach.
                            if approx_rate > 200:
                                # Start over assuming m3
                                current_vol_m3 = float(rt["capacity"])
                                approx_rate = (current_vol_m3 / eff_cap) * 100
                            
                            rt["rate"] = round(approx_rate, 1)
                            rt["isApproximate"] = True
                            # print(f"  [Approx] Calculated rate for {dam_id}: {rt['rate']}% (Vol: {rt['capacity']} / Cap: {eff_cap})")
                        except:
                            pass

            # Update output
            target = realtime_output[dam_id]
            target["rate"] = rt["rate"]
            target["level"] = rt["level"]
            target["inflow"] = rt["inflow"]
            target["outflow"] = rt["outflow"]
            target["updatedAt"] = rt["updatedAt"]
            if rt.get("isApproximate"):
                target["isApproximate"] = True
            matched_count += 1

    print(f"Successfully matched and updated {matched_count} dams.")
    
    with open(OUTPUT_REALTIME_JSON, 'w', encoding='utf-8') as f:
        json.dump(realtime_output, f, ensure_ascii=False, indent=2)
        
    print(f"Saved to {OUTPUT_REALTIME_JSON}")

if __name__ == "__main__":
    main()
