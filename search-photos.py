import json
import boto3
import requests

headers = {"Content-Type": "application/json"}
region = 'us-east-1'
lex = boto3.client('lex-runtime', region_name=region)

def lambda_handler(event, context):
    # TODO implement
    print(event)
    q1 = event['q']

    labels = get_labels(q1)
    print("labels", labels)
    
    if len(labels) == 0:
        return
    else:
        img_paths = get_photo_path(labels)

    return {
        'statusCode': 200,
        'body': {
            'imagePaths': img_paths,
            'userQuery': q1,
            'labels': labels,
        },
        'headers': {
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Credentials':True
        }
    }
    

def get_labels(query):
    lex = boto3.client('lex-runtime')
    response = lex.post_text(
        botName='SearchPhotos',
        botAlias='$LATEST',
        userId="Sheena",
        inputText=query
    )
    print("lex-response", response)

    labels = []
    if 'slots' not in response:
        print("No photo collection for query {}".format(query))
    else:
        print("slot: ", response['slots'])
        slot_val = response['slots']
        for key, value in slot_val.items():
            if value != None:
                labels.append(value)
    
    return labels
    
def get_photo_path(labels):
    img_paths = []
    unique_labels = []
    for x in labels:
        if x not in unique_labels:
            unique_labels.append(x)
    labels = unique_labels
    print("inside get photo path", labels)
    host = "https://search-photos-ya6zmaniwieqwp7qykoeal6vpa.us-east-1.es.amazonaws.com/photos"
    awsauth = ("*******", "**********")
    for i in labels:
        path = host + '/_search?q=labels:'+i
        response = requests.get(path, headers=headers,
                                auth=awsauth)
        print("response from ES", response)
        
        dict1 = json.loads(response.text)
        hits_count = dict1['hits']['total']['value']
        print("DICT : ", dict1)
        temp_list = []
        for k in range(0, hits_count):
            img_obj = dict1["hits"]["hits"]
            img_bucket = dict1["hits"]["hits"][k]["_source"]["bucket"]
            print("img_bucket", img_bucket)
            img_name = dict1["hits"]["hits"][k]["_source"]["objectKey"]
            print("img_name", img_name)
            if img_bucket == 'image-bucket-new':
                img_link = 'https://s3.amazonaws.com/' + str(img_bucket) + '/' + str(img_name)
                temp_list.append(img_link)
        if not img_paths:
            img_paths = temp_list
        else:
            img_paths = set(img_paths) & set(temp_list)
            
            
    print(img_paths)
    return list(img_paths)
