import pandas as pd
import numpy as np
#data = pd.read_csv("predict_1_1_5_6.csv")
#data = pd.read_csv("predicted_3_1.csv")
data = pd.read_csv("211061117.17N.csv")
#data = pd.read_csv("6_day.csv")
df = pd.DataFrame()
df['prn'] = data['prn']
df['sqrt_semi_major_axis'] = data['sqrt_semi_major_axis']
df['essentricity'] = data['essentricity']
df['inclination'] = data['inclination']
df['OMEGA'] = data['OMEGA']
df['omega'] = data['omega']
df['mean_anomaly'] = data['mean_anomaly']
for i in range(len(data)):
	df['sqrt_semi_major_axis'][i] = float(df['sqrt_semi_major_axis'][i])*float(df['sqrt_semi_major_axis'][i])/10000000
	df['OMEGA'][i] = float(df['OMEGA'][i] *(57.2957795131))%360
	if df['OMEGA'][i]<0:
		df['OMEGA'][i] = 360+df['OMEGA'][i]
	df['inclination'] = float(df['inclination'][i] *(57.2957795131))%180
	if df['inclination'][i]<0:
		df['inclination'][i] = 180+df['inclination'][i]
	df['omega'][i] = float(df['omega'][i]*(57.2957795131))%360
	if df['omega'][i]<0:
		df['omega'][i] = 360+df['omega'][i]
	df['mean_anomaly'][i] = float(df['mean_anomaly'][i] *(57.2957795131))%360
	if df['mean_anomaly'][i]<0:
		df['mean_anomaly'][i] = 360+df['mean_anomaly'][i]
data.to_csv("data.txt")
df.to_csv("5.txt")
#data.to_csv("data.txt")
#df.to_csv("5.txt")