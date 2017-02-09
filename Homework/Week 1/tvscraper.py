#!/usr/bin/env python
# Name: Ragger Jonkers
# Student number: 10542604
'''
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
'''
import csv

from pattern.web import URL, DOM

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    '''
    Extract a list of highest rated TV series from DOM (of IMDB page).

    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    '''

    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RATED TV-SERIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.

    tvseries = {}
    tvseries['titles'], tvseries['runtimes'], tvseries['ratings'], tvseries['genres'], tvseries['stars'] = [], [], [], [], []

    # Loop through every film entry
    for entry in dom('div.lister-item-content'):
        # TITLES
        header = entry('h3.lister-item-header')[0]
        tvseries['titles'].append(header('a')[0].content.encode('utf-8'))

        # RUNTIMES, GENRES
        runtimesAndGenresDiv = entry('p.text-muted')[0]
        tvseries['runtimes'].append(runtimesAndGenresDiv('span.runtime')[0].content.replace(" min", ""))
        tvseries['genres'].append(runtimesAndGenresDiv('span.genre')[0].content.strip()) 

        # RATING
        ratingsBar = entry('div.ratings-bar')[0]
        tvseries['ratings'].append(ratingsBar('strong')[0].content)

        # STARS
        starring = []
        starsDiv = entry('p')[2]
        for star in starsDiv('a'):
            starring.append(star.content.encode('utf-8'))
        tvseries['stars'].append(starring)
        
    return tvseries  


def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest rated TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    for i in range(0, len(tvseries['titles'])):
        writer.writerow([tvseries['titles'][i], tvseries['ratings'][i], tvseries['genres'][i], ','.join(tvseries['stars'][i] ), tvseries['runtimes'][i]])

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE TV-SERIES TO DISK

if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)
