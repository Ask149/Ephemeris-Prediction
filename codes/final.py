import os
import pandas as pd
import numpy as np
from fbprophet import Prophet
import glob
import matplotlib.pyplot as plt
import plotly.offline as py
import plotly.graph_objs as go
import cmath
import datetime
import multiprocessing as mp
from multiprocessing import Pool

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

df_final = pd.DataFrame()
df_final = df_final.append(pd.read_csv("csv_files/211251117.17N.csv"))
df_final = df_final.append(pd.read_csv("csv_files/211261117.17N.csv"))
df_final = df_final.append(pd.read_csv("csv_files/211271117.17N.csv"))
df_final = df_final.append(pd.read_csv("csv_files/211281117.17N.csv"))
df_final = df_final.append(pd.read_csv("csv_files/211291117.17N.csv"))

df_expect = pd.read_csv("csv_files/211301117.17N.csv")

df_final['epoch_time']=pd.to_datetime(df_final['epoch_time'], format='%Y-%m-%d %H:%M:%S')
df_final = df_final.sort_values(by=['epoch_time'])
df_final.shape

def mean_absolute_percentage_error(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    mapr = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
    return 0.0 if mapr!=mapr else mapr

df_predicted = pd.DataFrame()
acc_total = 0.0


def predict_each_satellite(prn):
    print(prn)
    df_temp = pd.DataFrame()
    avg_acc = 0.0

    df_prn = df_final.loc[df_final['prn'] == prn].reset_index() 
    df_expect2 = df_expect.loc[df_expect['prn'] == prn].reset_index()
    future = pd.DataFrame()
    future['ds'] = df_expect2['epoch_time']
    #print(future)

    df_m = pd.DataFrame()
    df_m['ds'] = df_prn['epoch_time']
    df_m['y'] = df_prn['epoch_time']
    model = Prophet()
    model.fit(df_m)
    #future = model.make_future_dataframe(periods=30, freq='H')
    df_temp['prn'] = prn
    df_temp['epoch_time'] = df_expect2['epoch_time']
    df_temp['prn'] = prn

    for column in list(df_prn.columns.values):
        #print('--------column--------- :'+ str(column))
        if column == 'prn' or column == 'epoch_time' or column=='index':
            continue
        
        if column == 'sv_clock_bias' or column == 'sv_clock_drift' or column == 'sv_clock_drift_rate' or column == 'mean_motion'  or  column == 'essentricity'  or column == 'sqrt_semi_major_axis'  or column == 'OMEGA' or column == 'inclination'  or column == 'omega' or column == 'OMEGA_dot' or column == 'inclination_rate' or column == 'codes' or column == 'gps_week' or column == 'l2_p_data_flag' or column == 'sv_accuracy' or column == 'sv_health' or column == 'tgd'  or column == 'fit_interval':
            df_m = pd.DataFrame()
            df_m['ds'] = df_prn['epoch_time']
            df_m['y'] = df_prn[column]

            model = Prophet()
            model.fit(df_m)

            forecast = model.predict(future)
            model.plot(forecast)
            #print('RMSE: %f' % (np.sqrt(np.mean((forecast.loc[:df2['y'].size-1, 'yhat']-df2['y'])**2))/np.abs(np.max(forecast.loc[:df2['y'].size-1, 'yhat']-df2['y']))))

            mse = mean_absolute_percentage_error(forecast['yhat'],df_expect2[column])
            #print("MSE: "+str(mse))
            avg_acc = avg_acc + mse
            df_temp[column] = forecast['yhat']
            del df_m
      
        if column == 'iode' or column == 'correction_radius_sine' or  column == 'correction_latitude_cosine' or column == 't_tx' or column == 'correction_latitude_sine' or  column == 'correction_inclination_cosine' or   column == 'correction_radius_cosine' or column == 'mean_anomaly' or  column == 'correction_inclination_sine':
            df_m = pd.DataFrame()
            df_m['ds'] = df_prn['epoch_time']
            df_m['y'] = df_prn[column]

            model = Prophet(changepoint_prior_scale=0.5)
            model.fit(df_m)

          
            forecast = model.predict(future)
            model.plot(forecast)
            #print('RMSE: %f' % (np.sqrt(np.mean((forecast.loc[:df2['y'].size-1, 'yhat']-df2['y'])**2))/np.abs(np.max(forecast.loc[:df2['y'].size-1, 'yhat']-df2['y']))))

            mse = mean_absolute_percentage_error(forecast['yhat'],df_expect2[column])
            #print("MSE: "+str(mse))
            avg_acc = avg_acc + mse
            df_temp[column] = forecast['yhat']
            del df_m
        
        if column == 'time_of_ephemeris' or column == 'iodc' :
            df_m = pd.DataFrame()
            df_m['ds'] = df_prn['epoch_time']
            df_m['y'] = df_prn[column]

            model = Prophet(changepoint_prior_scale=1.0)
            model.fit(df_m)

            forecast = model.predict(future)
            model.plot(forecast)

            #model.plot(forecast)
            #print('RMSE: %f' % (np.sqrt(np.mean((forecast.loc[:df2['y'].size-1, 'yhat']-df2['y'])**2))/np.abs(np.max(forecast.loc[:df2['y'].size-1, 'yhat']-df2['y']))))

            mse = mean_absolute_percentage_error(forecast['yhat'],df_expect2[column])
            #print("MSE: "+str(mse))
            avg_acc = avg_acc + mse
            df_temp[column] = forecast['yhat']
            del df_m
    

    #df_predicted = df_predicted.append(df_temp, ignore_index=True)
    print(df_temp.shape)

    print(" PRN : "+str(prn)+"  acc : "+str(avg_acc/30))

    return (df_temp,  avg_acc, prn)


if __name__ == '__main__':
    total_err = []
    prn_list = []
    a = datetime.datetime.now().replace(microsecond=0)
    input_prn = df_final['prn'].unique()
    pool = mp.Pool(processes = mp.cpu_count())
    for df_pred, err, prn in pool.map(predict_each_satellite, input_prn):
        df_predicted = df_predicted.append(df_pred, ignore_index=True)
        total_err.append(err)
        prn_list.append(prn)
    pool.close()
    pool.join()
    b = datetime.datetime.now().replace(microsecond=0)
    print(b-a)

    df_predicted.shape

    df_predicted

    df_predicted.reset_index()

    len(df_predicted['prn'].unique())

    df_predicted.to_csv(r'predicted_csv/predicted_5_1_1.csv')

    getdotn('predicted_csv/predicted_5_1_1.csv')


    err = []
    for e in total_err:
        err.append(e/30)

    plt.bar(prn_list, err)
    plt.xlabel('satellite number (prn)')
    plt.ylabel(' Error %')
    plt.show()