from datetime import datetime
import pandas as pd
def getdotn(cfname):
	head = '     2.10           N: GPS NAV DATA                         RINEX VERSION / TYPE\nConvert v1.7.0                          08-May-18 09:05     PGM / RUN BY / DATE \n    0.1211D-07 -0.7451D-08 -0.1192D-06  0.5960D-07          ION ALPHA           \n    0.9626D+05 -0.3277D+05 -0.1966D+06  0.1966D+06          ION BETA            \n     .279396772385D-08  .355271367880D-14   405504     1973 DELTA-UTC: A0,A1,T,W\n    18                                                      LEAP SECONDS\n                                                            END OF HEADER\n'
	row = []
	row.append(head)
	df = pd.read_csv(cfname)
	for line in open(cfname):
		row.append(line.split(','))
	index=0
	ind = 0
	stn_code = '211'
	dt = datetime.strftime(datetime.strptime(df['epoch_time'][0],'%Y-%m-%d %H:%M:%S'),'%y %m %d %H %M %S')
	re = dt.split(" ")
	yy = re[0]
	dd = re[2]
	mm = re[1]
	fname = stn_code+dd+mm+yy+"."+yy+"N"
	with open(fname,'w') as f:
		for item in row:
			if index==0 and ind!=1:
				index=1
				f.write("%s"%item)
				pass
			elif index==1 and ind!=1:
				col=0
				for i in range(len(item)):					
					if col==2:
						d = datetime.strptime(item[i], '%Y-%m-%d %H:%M:%S')
						f.write("%s.0  "%datetime.strftime(d,'%y %m %d %H %M %S'))
					elif not i==0:
						if (col-1)%4==0 and not col==1:
							f.write("%.12e  \n\t"%float(item[i]))
						else:
							if ind==2 and col==1:
								f.write("  %s "%item[i])
							elif col==1:
								f.write("%s "%item[i])
							else:
								f.write("%s  "%item[i])
					col+=1
			ind = ind + 1
getdotn('predicted_3_1.csv')