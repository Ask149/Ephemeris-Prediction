import pandas as pd
import numpy as np

data = pd.read_csv("6_day.csv")
for i in range(len(data)):
	data['sqrt_semi_major_axis'][i] = float(data['sqrt_semi_major_axis'][i])*float(data['sqrt_semi_major_axis'][i])
	data['OMEGA'][i] = float(data['OMEGA'] *(57.2957795131))
	if data['OMEGA'][i]<0:
		data['OMEGA'][i] = 360+data['OMEGA'][i]
	data['inclination'] = float(data['inclination'] *(57.2957795131))
	if data['inclination'][i]<0:
		data['inclination'][i] = 360+data['inclination'][i]
	data['omega'][i] = float(data['omega'] *(57.2957795131))
	if data['omega'][i]<0:
		data['omega'][i] = 360+data['omega'][i]
	data['mean_anomaly'][i] = float(data['mean_anomaly'] *(57.2957795131))
	if data['mean_anomaly'][i]<0:
		data['mean_anomaly'][i] = 360+data['mean_anomaly'][i]
data.to_csv("data.txt")