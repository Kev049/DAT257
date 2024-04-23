from flask import Flask,jsonify,request,flash,redirect,url_for
from flask_cors import CORS
import pandas as pd
import numpy as np
import matplotlib
import matplotlib.pyplot as plt

matplotlib.use('Agg')
import math as ma

app = Flask(__name__)
CORS(app)

@app.route("/<country>", methods=['GET'])
def query_data(country): # Returns a dataframe containing the country matching the input string and the data of that country.
                  # Will return an empty dataframe (but containing its columns) if the input does not match a country.
    #country = request.args.get('country',type=str)
    dataset = pd.read_csv('python/clumped_data.csv')
    #values = dataset[dataset['Country'].str.contains(fr'{country}', case=False)].reset_index().to_json(orient='records')
    formatted = (dataset[dataset['Country'].str.match(fr'{country}', case=False)].reset_index()).transpose()
    dropped = formatted.iloc[1: , :]
    html_table = dropped.to_html(classes='table')
    return html_table

@app.route("/chart/<country>", methods=['GET', 'POST'])
def get_plot(country):
    dataset = pd.read_csv('python/clumped_data.csv')
    energy_doc = (dataset[dataset['Country'].str.match(fr'{country}', case=False)])
    energy_doc = energy_doc.drop(['Code (alpha-3)', 'Country', 'Renewable energy production (%)'], axis=1)
    labels = energy_doc.columns.tolist()
    values = energy_doc.to_numpy().flatten()
    fig,ax = plt.subplots()
    ax.pie(values)
    fig.legend(labels=labels, loc='upper right', bbox_to_anchor=(0.1,1))
    fig.savefig('static/country_graph.png', bbox_inches='tight', pad_inches=1)
    return country
    


if __name__ == "__main__":
    app.run()