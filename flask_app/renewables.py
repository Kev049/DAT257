import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

dataset = pd.read_csv('flask_app/energyCon.csv')
energy_doc = (dataset[dataset['Entity'].str.match(fr'sweden', case=False)])
energy_doc = energy_doc.drop(['Code', 'Entity', 'Year'], axis=1).dropna(axis=1, how='all')
labels = energy_doc.columns.tolist()
values = energy_doc.to_numpy().flatten()

fig = plt.figure(figsize=(4.8,2))
plt.rc('axes.spines', **{'bottom':False, 'left':False, 'right':False, 'top':False})
ax = fig.add_subplot(111)
wedges = [] 
for i in range(len(values)):
    wedges.append(ax.plot(values[i]))
legend = fig.legend(labels, loc='center')
ax.get_xaxis().set_visible(False)
ax.get_yaxis().set_visible(False)
figLegend = plt.figure()
figLegend.legend(wedges, labels)
plt.show()
fig.savefig('ConLegend.png')