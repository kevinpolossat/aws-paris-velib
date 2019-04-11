import json
import boto3
import fileinput
import multiprocessing as mp
import os

processes = 4

# An array of boto3 IoT clients
IotBoto3Client = [boto3.client('iot-data') for i in range(processes)]

def publish_wrapper(lineID, line):
    # Select the appropriate boto3 client based on lineID
    client = IotBoto3Client[lineID % 4]

    line_read = line.strip()
    print "Publish: ", os.getpid(), lineID, line_read[:70], "..."
    payload = json.loads(line_read)
    print json.dumps(payload)

    # Publish JSON data to AWS IoT
    client.publish(
        topic='iot/open_data_velib',
        qos=1,
        payload=json.dumps(payload))

if __name__ == '__main__':
    pool = mp.Pool(processes)
    jobs = []
    print "Begin Data Ingestion"
    for ID, line in enumerate(fileinput.input()):
       # Create job for each JSON object
       res = jobs.append(pool.apply_async(publish_wrapper, (ID, line)))

    for job in jobs:
       job.get()

    print "Data Ingested Successfully"