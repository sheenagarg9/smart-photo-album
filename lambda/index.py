import json
import logging
from os import environ
import boto3
import time
import requests
import base64


logger = logging.getLogger()
logger.setLevel(logging.DEBUG)
logger.setLevel(logging.ERROR)


def lambda_handler(event, context):
    print(event)
    s3 = event['Records'][0]['s3']
    bucketName = s3['bucket']['name']
    imageKey = s3['object']['key']
    
    image = {"S3Object":{"Bucket":bucketName, "Name":imageKey}}
    
    s3_client = boto3.client('s3')
    client = boto3.client('rekognition')
    s3_clientobj = s3_client.get_object(Bucket=bucketName, Key=imageKey)
    body=s3_clientobj['Body'].read().decode('utf-8','ignore')
    image = base64.b64decode(body)
    
    
    print("metadata:", s3_clientobj)
    inputBucket = "image-bucket-new"
    response=s3_client.put_object(Bucket=inputBucket, Body=image, Key=imageKey,ContentType='image/jpg', Metadata=s3_clientobj['Metadata'])

    custom_labels = ""
    # Access your custom label
    if 'customlabels' in s3_clientobj['Metadata']:
        custom_labels = s3_clientobj['Metadata']['customlabels']
    print(custom_labels)
    
    print("Inside index-photos: ")
    print(bucketName)
    print(imageKey)
    rek_client = boto3.client('rekognition')
    response = rek_client.detect_labels(Image={'Bytes':image})
    
    timestamp = time.time()
    labels = []
    
    for lbl in custom_labels.split(","):
        labels.append(lbl)
    
    for label in response['Labels']:
        labels.append(label['Name'])
    
    jsonArr = {"objectKey":imageKey, "bucket":inputBucket, "createdTimestamp": timestamp, "labels": labels}
    
    print(labels)
    url = "https://search-photos-ya6zmaniwieqwp7qykoeal6vpa.us-east-1.es.amazonaws.com/photos/_doc"
    
    awsauth = ("sheenagarg9", "Sheenagarg9!")
    
    headers = {
        "Content-Type": "application/json"
    }
    response = requests.post(url,auth=awsauth, headers=headers, data=json.dumps(jsonArr))
    
    
    print(response.text)
    # TODO implement
    
    return {
        'statusCode': 200,
        'body': json.dumps(event)
    }
