# Ragger Jonkers
# 10542604

'''
After some reformatting of the csv by manually adding
country codes that weren't the same as the mapping list,
this file converts the correct csv to the json format that the
datamaps library requests. It also already categorizes the
country in its gdp range. This way the json dict can be inserted
into the datamap without further worrying.
'''

import csv
import json
import re

csv_file = open('gdp.csv', 'r')
countries = json.load(open('countries.json'))
json_file = open('gdp.json', 'w')

reader = csv.reader(csv_file, delimiter='\t');

def getCategory(value):
    '''
    Return the category the country belongs in
    given its gdp value
    '''
    cat = 'unavailable'
    if value < 500:
        cat = "<500"
    if value in range(500, 1000):
        cat = "500-1000"
    if value in range(1000, 2000):
        cat = "1000-2000"
    if value in range(2000, 4000):
        cat = "2000-4000"
    if value in range(4000, 8000):
        cat = "4000-8000"
    if value in range(8000, 16000):
        cat = "8000-16000"
    if value in range(16000, 32000):
        cat = "16000-32000"
    if value in range(32000, 64000):
        cat = "32000-64000"
    if value > 64000:
        cat = ">64000"
    return cat

def getCountryName(code):
    '''
    Return the full name given the country short code
    based on the external mapping list per country
    '''
    for mapping in countries:
        if code in mapping:
            return mapping[2]

data = {}

## Create Datamap data entries
for row in reader:
    country_code = row[0]
    value = int(row[1])
    data[country_code] = {}
    data[country_code]['fillKey'] = getCategory(value)
    data[country_code]['name'] = getCountryName(country_code)
    data[country_code]['gdp'] = value

## Data entries will look like this:
# 'MEX': {
#        fillKey: '16000-32000',
#        name: 'Mexico',
#        gdp: 18900
#       },



json.dump(data, json_file)