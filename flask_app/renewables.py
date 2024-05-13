import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import regex as re

dataset = pd.read_csv('flask_app/clumped_data.csv')
energy_doc = (dataset[dataset['Country'].str.match(fr'sweden', case=False)])
energy_doc = energy_doc.drop(['Code (alpha-3)', 'Country', 'Renewable energy production (%)'], axis=1).dropna(axis=1, how='all')
new_cols = []
for item in energy_doc.columns:
    new_cols.append(item.replace('(GWh)', ''))
energy_doc.columns = new_cols
labels = energy_doc.columns.tolist()
values = energy_doc.to_numpy().flatten()

fig = plt.figure(figsize=(3,2.2))
plt.rc('axes.spines', **{'bottom':False, 'left':False, 'right':False, 'top':False})
ax = fig.add_subplot(111)
wedges = [] 
for i in range(len(values)):
    wedges.append(ax.plot(values[i]))
legend = fig.legend(labels, loc='center')
ax.get_xaxis().set_visible(False)
ax.get_yaxis().set_visible(False)
plt.show()
fig.savefig('ProdLegend.png')