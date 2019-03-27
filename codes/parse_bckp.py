import pandas as pd
import numpy as np
data = pd.read_csv("predict_1_1_5_6.csv")
df = pd.DataFrame()
df['prn'] = data['prn']
df['sqrt_semi_major_axis'] = data['sqrt_semi_major_axis']
df['essentricity'] = data['essentricity']
df['inclination'] = data['inclination']
df['OMEGA'] = data['OMEGA']
df['omega'] = data['omega']
df['mean_anomaly'] = data['mean_anomaly']
for i in range(len(data)):
	data['sqrt_semi_major_axis'][i] = float(data['sqrt_semi_major_axis'][i])*float(data['sqrt_semi_major_axis'][i])
	data['OMEGA'][i] = float(data['OMEGA'][i] *(57.2957795131))
	if data['OMEGA'][i]<0:
		data['OMEGA'][i] = 360+data['OMEGA'][i]
	data['inclination'] = float(data['inclination'][i] *(57.2957795131))
	if data['inclination'][i]<0:
		data['inclination'][i] = 360+data['inclination'][i]
	data['omega'][i] = float(data['omega'][i]*(57.2957795131))
	if data['omega'][i]<0:
		data['omega'][i] = 360+data['omega'][i]
	data['mean_anomaly'][i] = float(data['mean_anomaly'][i] *(57.2957795131))
	if data['mean_anomaly'][i]<0:
		data['mean_anomaly'][i] = 360+data['mean_anomaly'][i]
	df['sqrt_semi_major_axis'][i] = float(df['sqrt_semi_major_axis'][i])*float(df['sqrt_semi_major_axis'][i])
	df['OMEGA'][i] = float(df['OMEGA'][i] *(57.2957795131))
	if df['OMEGA'][i]<0:
		df['OMEGA'][i] = 360+df['OMEGA'][i]
	df['inclination'] = float(df['inclination'][i] *(57.2957795131))
	if df['inclination'][i]<0:
		df['inclination'][i] = 360+df['inclination'][i]
	df['omega'][i] = float(df['omega'][i]*(57.2957795131))
	if df['omega'][i]<0:
		df['omega'][i] = 360+df['omega'][i]
	df['mean_anomaly'][i] = float(df['mean_anomaly'][i] *(57.2957795131))
	if df['mean_anomaly'][i]<0:
		df['mean_anomaly'][i] = 360+df['mean_anomaly'][i]
data.to_csv("predict.txt")
df.to_csv("6.txt")