import math
import datetime
import pandas as pd
df1 = pd.read_csv('predicted_5_1_1.csv')

df = pd.read_csv('211301117.17N.csv')
#df = pd.read_csv('prn_2_pred.csv')
#df = df2[df2['epoch_time']=='2017-11-02 02:00:00']
ti1 = []
ti2 = []
x1 = []
x2 = []
y1 = []
y2 = []
z1 = []
z2 = []
a1 = []
a2 = []
e1 = []
e2 = []
i1 = []
i2 = []
bo1= []
bo2= []
so1= []
so2= []
ma1= []
ma2= []
bPI =  3.1415926535898
bGM84 =  3.986005e14
bOMEGAE84 =  7.2921151467e-5
myprn = 2
earthrate = bOMEGAE84;
for i in range(len(df)):
    if df['prn'][i]==myprn:
        roota = df['sqrt_semi_major_axis'][i]
        t = 86400# df['time_of_ephemeris'][i]#86400.00;
        e = df['essentricity'][i]
        i0 = df['inclination'][i]
        smallomega = df['omega'][i]
        bigomega0 = df['OMEGA'][i]
        m0 = df['mean_anomaly'][i]

        toe = df['time_of_ephemeris'][i]

        cus = df['correction_latitude_sine'][i]
        cuc = df['correction_latitude_cosine'][i]
        crs = df['correction_radius_sine'][i]
        cis = df['correction_inclination_sine'][i]
        cic = df['correction_inclination_cosine'][i]
        crc = df['correction_radius_cosine'][i]
        delta_n = df['mean_motion'][i]
        bigomegadot = df['OMEGA_dot'][i]
        idot = df['inclination_rate'][i]



        A = roota*roota;           #roota is the square root of A
        n0 = math.sqrt(bGM84/(A*A*A));  #bGM84 is what the ICD-200 calls Greek mu
        tk = t - toe;              #t is the time of the pos. & vel. request.
        n = n0 + delta_n;
        mk = m0 + n*tk;
        mkdot = n;
        ek = mk;
        for itera in range(0,7):
            ek = mk + e*math.sin(ek);  #Overkill for small e
        ekdot = mkdot/(1.0 - e*math.cos(ek));
        #In the line, below, tak is the true anomaly (which is nu in the ICD-200).
        tak = math.atan2( math.sqrt(1.0-e*e)*math.sin(ek), math.cos(ek)-e);
        takdot = math.sin(ek)*ekdot*(1.0+e*math.cos(tak))/(math.sin(tak)*(1.0-e*math.cos(ek)));

        phik = tak + smallomega;
        corr_u = cus*math.sin(2.0*phik) + cuc*math.cos(2.0*phik);
        corr_r = crs*math.sin(2.0*phik) + crc*math.cos(2.0*phik);
        corr_i = cis*math.sin(2.0*phik) + cic*math.cos(2.0*phik);
        uk = phik + corr_u;
        rk = A*(1.0-e*math.cos(ek)) + corr_r;
        ik = i0 + idot*tk + corr_i;

        ukdot = takdot +2.0*(cus*math.cos(2.0*uk)-cuc*math.sin(2.0*uk))*takdot;
        rkdot = A*e*math.sin(ek)*n/(1.0-e*math.cos(ek)) + 2.0*(crs*math.cos(2.0*uk)-crc*math.sin(2.0*uk))*takdot;
        ikdot = idot + (cis*math.cos(2.0*uk)-cic*math.sin(2.0*uk))*2.0*takdot;

        xpk = rk*math.cos(uk);
        ypk = rk*math.sin(uk);

        xpkdot = rkdot*math.cos(uk) - ypk*ukdot;
        ypkdot = rkdot*math.sin(uk) + xpk*ukdot;

        omegak = bigomega0 + (bigomegadot-earthrate)*tk - earthrate*toe;

        omegakdot = (bigomegadot-earthrate);

        xk = xpk*math.cos(omegak) - ypk*math.sin(omegak)*math.cos(ik);
        yk = xpk*math.sin(omegak) + ypk*math.cos(omegak)*math.cos(ik);
        zk =                   ypk*math.sin(ik);

        xkdot = ( xpkdot-ypk*math.cos(ik)*omegakdot )*math.cos(omegak)- ( xpk*omegakdot+ypkdot*math.cos(ik)-ypk*math.sin(ik)*ikdot )*math.sin(omegak);
        ykdot = ( xpkdot-ypk*math.cos(ik)*omegakdot )*math.sin(omegak)+ ( xpk*omegakdot+ypkdot*math.cos(ik)-ypk*math.sin(ik)*ikdot )*math.cos(omegak);
        zkdot = ypkdot*math.sin(ik) + ypk*math.cos(ik)*ikdot;

        #print(xk, yk, zk)
        
        print("\n")
        print(str(float(df['sqrt_semi_major_axis'][i]*df['sqrt_semi_major_axis'][i])),df['essentricity'][i],df['inclination'][i]*180/math.pi,df['OMEGA'][i]*180/math.pi,df['omega'][i]*180/math.pi,df['mean_anomaly'][i]*180/math.pi)
        print("\n")

        ti1.append(df['epoch_time'][i])
        x1.append(xk)
        a1.append(df['sqrt_semi_major_axis'][i])
        e1.append(df['essentricity'][i])
        i1.append(df['inclination'][i])
        bo1.append(df['OMEGA'][i])
        so1.append(df['omega'][i])
        ma1.append(df['mean_anomaly'][i])
        y1.append(yk)
        z1.append(zk)
        print(df['epoch_time'][i]," cuc ",cuc," , crc ",crc,", cis ",cis,", cic ",cic," cus ",cus," crs ",crs)

for i in range(len(df1)):    
    if df1['prn'][i]==myprn:
        roota = df1['sqrt_semi_major_axis'][i]
        e = df1['essentricity'][i]
        i0 = df1['inclination'][i]
        smallomega = df1['omega'][i]
        bigomega0 = df1['OMEGA'][i]
        m0 = df1['mean_anomaly'][i]

        toe = df1['time_of_ephemeris'][i]

        cus = df1['correction_latitude_sine'][i]
        cuc = df1['correction_latitude_cosine'][i]
        crs = df1['correction_radius_sine'][i]
        cis = df1['correction_inclination_sine'][i]
        cic = df1['correction_inclination_cosine'][i]
        crc = df1['correction_radius_cosine'][i]
        delta_n = df1['mean_motion'][i]
        bigomegadot = df1['OMEGA_dot'][i]
        idot = df1['inclination_rate'][i]

        A = roota*roota;           #roota is the square root of A
        n0 = math.sqrt(bGM84/(A*A*A));  #bGM84 is what the ICD-200 calls Greek mu
        tk = t - toe;              #t is the time of the pos. & vel. request.
        n = n0 + delta_n;
        mk = m0 + n*tk;
        mkdot = n;
        ek = mk;
        for itera in range(0,7):
            ek = mk + e*math.sin(ek);  #Overkill for small e
        ekdot = mkdot/(1.0 - e*math.cos(ek));
        #In the line, below, tak is the true anomaly (which is nu in the ICD-200).
        tak = math.atan2( math.sqrt(1.0-e*e)*math.sin(ek), math.cos(ek)-e);
        takdot = math.sin(ek)*ekdot*(1.0+e*math.cos(tak))/(math.sin(tak)*(1.0-e*math.cos(ek)));

        phik = tak + smallomega;
        corr_u = cus*math.sin(2.0*phik) + cuc*math.cos(2.0*phik);
        corr_r = crs*math.sin(2.0*phik) + crc*math.cos(2.0*phik);
        corr_i = cis*math.sin(2.0*phik) + cic*math.cos(2.0*phik);
        uk = phik + corr_u;
        rk = A*(1.0-e*math.cos(ek)) + corr_r;
        ik = i0 + idot*tk + corr_i;

        ukdot = takdot +2.0*(cus*math.cos(2.0*uk)-cuc*math.sin(2.0*uk))*takdot;
        rkdot = A*e*math.sin(ek)*n/(1.0-e*math.cos(ek)) + 2.0*(crs*math.cos(2.0*uk)-crc*math.sin(2.0*uk))*takdot;
        ikdot = idot + (cis*math.cos(2.0*uk)-cic*math.sin(2.0*uk))*2.0*takdot;

        xpk = rk*math.cos(uk);
        ypk = rk*math.sin(uk);

        xpkdot = rkdot*math.cos(uk) - ypk*ukdot;
        ypkdot = rkdot*math.sin(uk) + xpk*ukdot;

        omegak = bigomega0 + (bigomegadot-earthrate)*tk - earthrate*toe;

        omegakdot = (bigomegadot-earthrate);

        xk = xpk*math.cos(omegak) - ypk*math.sin(omegak)*math.cos(ik);
        yk = xpk*math.sin(omegak) + ypk*math.cos(omegak)*math.cos(ik);
        zk = ypk*math.sin(ik);

        xkdot = ( xpkdot-ypk*math.cos(ik)*omegakdot )*math.cos(omegak)- ( xpk*omegakdot+ypkdot*math.cos(ik)-ypk*math.sin(ik)*ikdot )*math.sin(omegak);
        ykdot = ( xpkdot-ypk*math.cos(ik)*omegakdot )*math.sin(omegak)+ ( xpk*omegakdot+ypkdot*math.cos(ik)-ypk*math.sin(ik)*ikdot )*math.cos(omegak);
        zkdot = ypkdot*math.sin(ik) + ypk*math.cos(ik)*ikdot;

        #Results follow.
        #print("BCpos: t, xk, yk, zk: %9.3Lf %21.11Lf %21.11Lf %21.11Lf\n", t, xk, yk, zk );
        #print(xk, yk, zk)
        """d = datetime.strptime(df1['epoch_time'][i], '%Y-%m-%d %H:%M:%S')
        datetime.strftime(d,'%y %m %d %H %M %S')"""
        print()
        print(str(float(df1['sqrt_semi_major_axis'][i]*df1['sqrt_semi_major_axis'][i])),df1['essentricity'][i],df1['inclination'][i]*180/math.pi,df1['OMEGA'][i]*180/math.pi,df1['omega'][i]*180/math.pi,df1['mean_anomaly'][i]*180/math.pi)
        print()
        a2.append(df1['sqrt_semi_major_axis'][i])
        e2.append(df1['essentricity'][i])
        i2.append(df1['inclination'][i])
        bo2.append(df1['OMEGA'][i])
        so2.append(df1['omega'][i])
        ma2.append(df1['mean_anomaly'][i])
        ti2.append(df1['epoch_time'][i])
        x2.append(xk)
        y2.append(yk)
        z2.append(zk)
        print(df1['epoch_time'][i]," cuc ",cuc," , crc ",crc,", cis ",cis,", cic ",cic," cus ",cus," crs ",crs)

df3 = pd.DataFrame()
#df3['epoch_time1'] = ti1
df3['epoch_time'] = ti2
df3['sqrt_semi_major_axis actual'] = a1
df3['sqrt_semi_major_axis predicted'] = a2
df3['eccentricity actual'] = e1
df3['eccentricity predicted'] = e2
df3['inclination actual'] = i1
df3['inclination predicted'] = i2
df3['OMEGA actual'] = bo1
df3['OMEGA predicted'] = bo2
df3['omega actual'] = so1
df3['omega predicted'] = so2
df3['mean anomaly actual'] = ma1
df3['mean anomaly predicted'] = ma2
df3['x_actual'] = x1
df3['x_predicted'] = x2
df3['y_actual'] = y1
df3['y_predicted'] = y2
df3['z_actual'] = z1
df3['z_predicted'] = z2
dx = []
dy = []
dz = []
for i in range(len(x1)):
    dx.append(math.sqrt((x1[i]-x2[i])**2))
    dy.append(math.sqrt((y1[i]-y2[i])**2))
    dz.append(math.sqrt((z1[i]-z2[i])**2))

re=[]
for i in range(len(x1)):
    re.append(math.sqrt(dx[i]**2+dy[i]**2+dz[i]**2))
df3['dx'] = dx
df3['dy'] = dy
df3['dz'] = dz
df3['radial_error'] = re
df3.to_csv('Output.csv')

for i in range(4):
    print("x1 = "+str(x1[i]),"x2 = "+str(x2[i]),"diff = "+str(x1[i]-x2[i]),ti1[i],ti2[i])
    print("y1 = "+str(y1[i]),"y2 = "+str(y2[i]),"diff = "+str(y1[i]-y2[i]),ti1[i],ti2[i])
    print("z1 = "+str(z1[i]),"z2 = "+str(z2[i]),"diff = "+str(z1[i]-z2[i]),ti1[i],ti2[i])
