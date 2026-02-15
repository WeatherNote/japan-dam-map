
import json
import os
import sys
import time
from datetime import datetime, timedelta
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

# Kawabou Master Data Fetcher
# Purpose: Fetch dam NAMES and match them to obsFcd (Station Codes).
# Logic:
# 1. Finds latest valid timestamp for gjson data (which contains names).
# 2. Iterates all 47 prefectures to find active Town Codes (twnCd).
# 3. Fetches detailed gjson/obs/{TS}/dam/{twnCd}.json for each town.
# 4. Extracts obs_fcd -> obs_nm mapping.
# 5. Saves to data/kawabou_dam_master.json

BASE_URL_OBSLIST = "https://www.river.go.jp/kawabou/file/files/obslist/twninfo/tm/dam"
BASE_URL_GJSON = "https://www.river.go.jp/kawabou/file/gjson/obs"
OUTPUT_FILE = os.path.join("data", "kawabou_dam_master.json")

def fetch_json(url):
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req) as response:
            if response.status == 200:
                return json.loads(response.read().decode('utf-8'))
    except (URLError, HTTPError) as e:
        # print(f"Failed to fetch {url}: {e}")
        pass
    return None

def find_latest_timestamp():
    """Find the latest available timestamp by checking recent intervals."""
    # Try using obslist data to find a valid timestamp from obsTime?
    # Fetch random pref (e.g. 3901 Kochi)
    url = f"{BASE_URL_OBSLIST}/3901.json"
    data = fetch_json(url)
    if data and "prefTwn" in data:
        for twn in data["prefTwn"]:
            if "dam" in twn and twn["dam"]:
                obs_time_str = twn["dam"][0]["obsTime"] # e.g. "2026/02/12 17:10"
                # Parse and round to nearest 10 min?
                # Actually gjson file name format is YYYYMMDD/HHMM
                try:
                    dt = datetime.strptime(obs_time_str, "%Y/%m/%d %H:%M")
                    # Round down to 10 mins just in case
                    minute = (dt.minute // 10) * 10
                    dt = dt.replace(minute=minute, second=0)
                    ts = dt.strftime("%Y%m%d/%H%M")
                    print(f"Detected latest timestamp from obslist: {ts}")
                    return ts
                except ValueError:
                    pass
    
    # Fallback to brute force
    now = datetime.now()
    minute = (now.minute // 10) * 10
    target_time = now.replace(minute=minute, second=0, microsecond=0)

    for i in range(6):
        url_time = target_time.strftime("%Y%m%d/%H%M")
        # Try fetching a known existing file (Sameura town code 3901363)
        url = f"{BASE_URL_GJSON}/{url_time}/dam/3901363.json"
        if fetch_json(url):
             print(f"Valid timestamp found via brute-force: {url_time}")
             return url_time
        target_time -= timedelta(minutes=10)
        time.sleep(1)
        
    return None

def main():
    print("Starting Kawabou Master Data Fetcher...")
    
    # 1. Get Timestamp
    timestamp = find_latest_timestamp()
    if not timestamp:
        print("Could not determine valid timestamp. Aborting.")
        sys.exit(1)
        
    # 2. Get All Town Codes from Prefs
    twn_codes = set()
    print("Collecting town codes from all 47 prefectures...")
    
    for i in range(1, 48):
        pref_code = f"{i:02}01" # 0101, 0201...
        url = f"{BASE_URL_OBSLIST}/{pref_code}.json"
        data = fetch_json(url)
        
        if data and "prefTwn" in data:
            for twn in data["prefTwn"]:
                if "dam" in twn and len(twn["dam"]) > 0:
                    twn_codes.add(twn["twnCd"])
        
        if i % 10 == 0: print(f"  Scanned {i}/47 prefectures...")
        time.sleep(0.05)
        
    print(f"Found {len(twn_codes)} towns with dam data.")
    
    # 3. Fetch Details for Each Town and Build Map
    obs_map = {} # obsFcd -> { name, twnCd, etc }
    
    print("Fetching detailed names for each town...")
    count = 0
    twn_list = list(twn_codes)
    
    for idx, twn_cd in enumerate(twn_list):
        url = f"{BASE_URL_GJSON}/{timestamp}/dam/{twn_cd}.json"
        data = fetch_json(url)
        
        if data and "features" in data:
            for feat in data["features"]:
                props = feat["properties"]
                obs_fcd = props.get("obs_fcd")
                obs_nm = props.get("obs_nm")
                
                if obs_fcd and obs_nm:
                    obs_map[obs_fcd] = {
                        "name": obs_nm,
                        "kana": props.get("obs_kana"),
                        "river": props.get("rvr_nm"), 
                        "lat": props.get("lat"),
                        "lon": props.get("lon"),
                        "prefCd": props.get("pref_cd"),
                        "twnCd": twn_cd
                    }
        
        count += 1
        if count % 20 == 0:
            print(f"  Processed {count}/{len(twn_list)} towns...")
        time.sleep(0.05) # Be gentle
        
    print(f"Completed mapping. Found {len(obs_map)} unique dams.")
    
    # 4. Save to JSON
    output_data = {
        "_updated": datetime.now().isoformat(),
        "_timestamp_used": timestamp,
        "dams": obs_map
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
        
    print(f"Saved master data to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
