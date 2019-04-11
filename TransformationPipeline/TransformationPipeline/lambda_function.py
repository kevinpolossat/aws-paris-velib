from __future__ import print_function

import json
from datetime import datetime

print('Loading function')


def lambda_handler(event, context):
   print("Received event: " + json.dumps(event, indent=2))
   for e in event:
       if "time" in e:
            print("Received.e: " + json.dumps(e, indent=2))
            e["timestamp_fr"] = datetime.utcfromtimestamp(e["time"] / 1000).strftime("%Y-%m-%d %H:%M:%S")
   return event
