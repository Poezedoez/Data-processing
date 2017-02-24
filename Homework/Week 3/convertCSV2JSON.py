import csv
import json

csv_file = open('rainfall.csv', 'r')
json_file = open('rainfall.json', 'w')

reader = csv.reader(csv_file);

data = [{"month": row[0], "rainfall": int(row[1])} for row in reader]

json.dump(data, json_file)
