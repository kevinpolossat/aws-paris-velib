# Simple aws project to provide data visualisation on paris velib!

## Context
The goal of this project was to see how fast I could deliver an IoT solution with insight on timeserie data using AWS and experience myself how easy it is to build a solution around AWS and most of all to avoid to do things as much as possible, reduce heavy lifting and enjoy the journey.  

## The right data
* Finding open source IoT data is was kinda hard and I endup finding open source from Paris (https://opendata.paris.fr/explore/dataset/velib-disponibilite-en-temps-reel/information/). I Have to say I was quite surprise that such data was provided and available. I then decided to use it.  
* For each velib station located in Paris, data about the current availability are given.
* The data is updated every minute. 
* The website expose an api to download an actualized dataset under the csv format. 

Here is a sanple of the data:  

| Nombre de bornes disponibles | Nombre vélo en PARK+ | Nombres de bornes en station | PARK + activation | densityLevel | Achat possible en station (CB) | maxBikeOverflow | Etat du Totem | nbFreeDock | Nombre de vélo mécanique | PARK + | nbDock | Nombre vélo électrique | Nombre vélo en PARK+ | Code de la station | Nom de la station               | Etat des stations | Type de stations | geo                          | duedate    | 
|------------------------------|----------------------|------------------------------|-------------------|--------------|--------------------------------|-----------------|---------------|------------|--------------------------|--------|--------|------------------------|----------------------|--------------------|---------------------------------|-------------------|------------------|------------------------------|------------| 
| 28                           | 0                    | 35                           | no                | 1            | no                             | 0               | yes           | 0          | 5                        | no     | 0      | 2                      | 0                    | 16107              | Benjamin Godard - Victor Hugo   | Operative         | yes              | 48.865983, 2.275725          | 2018-07-15 | 
| 13                           | 0                    | 39                           | no                | 1            | yes                            | 0               | yes           | 0          | 22                       | no     | 0      | 4                      | 0                    | 11037              | Faubourg Du Temple - Republique | Operative         | yes              | 48.8678724847, 2.36489821581 | 2019-04-07 | 
| 17                           | 0                    | 20                           | no                | 1            | yes                            | 0               | yes           | 0          | 3                        | no     | 0      | 0                      | 0                    | 6021               | Beaux-Arts - Bonaparte          | Operative         | yes              | 48.8566039746, 2.33474291861 | 2018-06-22 | 
| 16                           | 0                    | 21                           | no                | 1            | yes                            | 21              | yes           | 0          | 0                        | no     | 0      | 5                      | 0                    | 9020               | Toudouze - Clauzel              | Operative         | yes              | 48.8792959173, 2.33736008406 | 2018-11-30 | 

## Simulating the iot sensors
- Data collection: a program that call the api. this task is done by 'getAndSaveData.js'.
- Data publishing: is done by 'publish_to_aws_topic_par.py'
- 'push_all_ds.sh' is a simple script to push all the file presents in a 'datasets' direcetory.

## Aws stack
From the aws point of view we're using 3 componenents:

### View
![Alt text](resources/aws-paris-velib.png?raw=true "abstract view")  

### AWS Lambda
[AWS Lambda](https://aws.amazon.com/lambda/) lets you run code without provisioning or managing servers. You pay only for the compute time you consume - there is no charge when your code is not running.  

I used a lambda in the IoT pipeline, it is used to enrich the payload abd output a resulting message. 

### AWS IoT Analytics  
[AWS IoT Analytics ](https://aws.amazon.com/iot-analytics/)is a fully-managed service that makes it easy to run and operationalize sophisticated analytics on massive volumes of IoT data without having to worry about the cost and complexity typically required to build an IoT analytics platform. It is the easiest way to run analytics on IoT data and get insights to make better and more accurate decisions for IoT applications and machine learning use cases.  

1.  A channel is bound to a MQTT topic on which our sensors are going to publish the data in. We can monitor the channell activity through the Iot Analytics console.
![Alt text](resources/channel.png?raw=true "abstract view")  

2.  A pipeline that is going to enrich the original the payload
3.  A lambda in the pipeline to enrich the payload
![Alt text](resources/lambda.png?raw=true "abstract view")  

4.  A datastore on which the payload are going to be stored
5.  A Dataset can be generated fron a SQL query on the datastore, furthermore it is schedulded to be updated at some time interval

### QuickSight
[Amazon QuickSight](https://aws.amazon.com/quicksight/) is a fast, cloud-powered business intelligence service that makes it easy to deliver insights to everyone in your organization.   
Quick sight is used to deliver analysis on the sensors, as they produce data on realtime, using QuickSight allows me to have graphical representation of timeserie data's analytics. In our case we use for a monthly insight on the velib station.

* Map view of the station scaled by the number of bike available
![Alt text](resources/map.png?raw=true "abstract view")  
* Chart view of the number of bike available per station 
![Alt text](resources/chart.png?raw=true "abstract view")  
* curve view of the number of bike available over time  
![Alt text](resources/curve.png?raw=true "abstract view")  

## pricing  
Assuming that the station are updated once every minute and there are around 1400 station, we will have then 1400 messages per minute, hence 60480000 messages published in our pipeline per month, each message is approximatly 300 bytes, hence 1.8GB per month.
### lambda
each lambda is setup to receive 10 messages at time, hence being invoked 1000000 times, which feet in the free tiers, or to compute a cost without taking into accound the free tiers, the duration for each lambda is 50ms, this in mind the cost per month for this lambda will be 0.000000625$
### AWS IoT Analytics
#### Pipeline
Monthly Charges = 1.8 GB X $0.03 per GB per month = $0.054 per month
#### AWS IoT Analytics Datastore
Monthly Charges = 1.8 GB X $0.03 per GB per month = $0.054 per month
#### AWS IoT Analytics Datastore s3
Monthly Charges = 1.8 GB X $0.023 per GB per month= $0.0414 per month
#### AWS Dataset query
Monthly Charges = 0.0018 TB of data scanned X $6.50 per TB scanned = $0.0117
#### AWS QuickSight
Run quicksight for one publisher 
Monthly Charges = 18$ per month per user
let's say that we send the dashboard to all our 50 fake employees every day, and they spend 30 minutes on the dashboard
Monthly Charges = 0,30 * 50 = 15$ per month
#### total
Monthly charges = lambda + Iot = $0.000000625 + $0.054 + $0.054 + $0.0414 + $0.0117 + 18$ + 15$ = $33.1611006

## What's next ?

* I would like to automate the deployment using cloud formation
* Provide real time analysis and anomaly detection.  

## resources

* https://aws.amazon.com/blogs/iot/using-aws-iot-analytics-to-prepare-data-for-quicksight-time-series-visualizations/  
* https://aws.amazon.com/blogs/aws/launch-presenting-aws-iot-analytics/
* https://docs.aws.amazon.com/iotanalytics/latest/userguide/getting-started.html  
* https://opendata.paris.fr/explore/dataset/velib-disponibilite-en-temps-reel/information
