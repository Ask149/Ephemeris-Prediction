"""Parser for GNSS data obtained from
CDDIS website in RINEX format"""


#for each set of 8 lines : get all the params
import csv
import os
import glob

from datetime import datetime
def gettimestamp(vdate):
    time_obj = datetime.strptime(str(datetime.strptime(vdate,'%y %m %d %H %M %S.%f')).lstrip("0").replace(" 0", " "),'%Y-%m-%d %H:%M:%S')
    #time_obj = datetime.strptime(vdate,'%y %-m %-d %-H %-M %-S.%f')
    timestamp = time_obj.timestamp()
    return datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')

fields = ['prn', 'epoch_time', 'sv_clock_bias', 'sv_clock_drift','sv_clock_drift_rate','iode','correction_radius_sine','mean_motion', 'mean_anomaly',
            'correction_latitude_cosine','eccentricity','correction_latitude_sine','sqrt_semi_major_axis','time_of_ephemeris','correction_inclination_cosine','OMEGA',
            'correction_inclination_sine','inclination','correction_radius_cosine','omega','OMEGA_dot','inclination_rate','codes','gps_week','l2_p_data_flag',
            'sv_accuracy','sv_health','tgd','iodc','t_tx', 'fit_interval']

lst = glob.glob('~/ephemeris_data/001/*')

for each in lst:
    with open(each) as nfile:
        nfile_lines = nfile.readlines()

    efile = each.split("/")[-1]

    with open('~/ephemeris_data/csv1/' + efile + '.csv', 'w') as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(fields)

        for i in range(len(nfile_lines)):
            nfile_lines[i] = nfile_lines[i].replace('D','E').strip().split(' ')

        for i in range(0, len(nfile_lines), 8):
            row1 = nfile_lines[i]
            row2 = nfile_lines[i+1]
            row3 = nfile_lines[i+2]
            row4 = nfile_lines[i+3]
            row5 = nfile_lines[i+4]
            try:
                row6 = nfile_lines[i+5]
            except:
                break
            row7 = nfile_lines[i+6]
            row8 = nfile_lines[i+7]

            row1 = list(filter(None, row1))
            
            PRN = row1[0]
            sv_clock_drift_rate = row1[-1]

            if len(row1) == 8:
                secs = row1[-2].split('-')[0]
                if '-' in row1[-2]:
                    idx = row1[-2].index("-")
                    sv_clock_bias = row1[-2][idx:idx+19]
                    sv_clock_drift = row1[-2][idx+19:]
            elif len(row1) == 9:
                if len(row1[-2]) > 18:
                    sv_clock_bias = row1[-2][:18]
                    sv_clock_drift = row1[-2][18:]
                    secs = row1[6]
                else:
                    if row1[-3][3] == '-':
                        sv_clock_bias = row1[-3][3:]
                        secs = row1[-3][:3]
                    else:
                        sv_clock_bias = row1[-3][4:]
                        secs = row1[-3][:4]
                    sv_clock_drift = row1[-2]

            elif len(row1) == 10:
                sv_clock_bias = row1[-3]
                sv_clock_drift = row1[-2]
                secs = row1[6]

            #print(row1)
            epoch_val = row1[1] + " " + row1[2] + " " + row1[3] + " " + row1[4] + " " + row1[5] + " " + secs
            #print(epoch_val)

#            print(efile)
            try:
                epoch_time = gettimestamp(epoch_val)
            except:
                break

            row2 = list(filter(None, row2))
            if len(row2) == 4:
                IODE = row2[0]
                correction_radius_sine = row2[1]
                mean_motion_deln = row2[2]
                mean_anomaly = row2[3]
            elif len(row2) == 3:
                if len(row2[-1])>18:
                    IODE = row2[0]
                    correction_radius_sine = row2[1]
                    mean_motion_deln = row2[2][:18]
                    mean_anomaly = row2[2][18:]
                else:
                    IODE = row2[0][:18]
                    correction_radius_sine = row2[0][18:]
                    mean_motion_deln = row2[1]
                    mean_anomaly = row2[2]
            elif len(row2) == 2:
                IODE = row2[0][:18]
                correction_radius_sine = row2[0][18:]
                mean_motion_deln = row2[1][:18]
                mean_anomaly = row2[1][18:]

            row3 = list(filter(None, row3))
            correction_latitude_cosine = row3[0]
            eccentricity = row3[1]
            correction_latitude_sine = row3[2]
            sqrt_semi_major_axis = row3[3]

            row4 = list(filter(None, row4))
            if len(row4)==1:
                time_of_ephemeris = row4[0][:18]
                correction_inclination_cosine = row4[0][18:37]
                OMEGA = row4[0][37:56]
                correction_inclination_sine = row4[0][56:]
            elif len(row4)==2:
                if len(row4[0]) == 18:
                    time_of_ephemeris = row4[0]
                    correction_inclination_cosine = row4[1][:18]
                    OMEGA = row4[1][18:37]
                    correction_inclination_sine = row4[1][37:56]
                elif len(row4[0]) == 37:
                    time_of_ephemeris = row4[0][:18]
                    correction_inclination_cosine = row4[0][18:37]
                    OMEGA = row4[1][:18]
                    correction_inclination_sine = row4[1][37:56]
                elif len(row4[0]) == 56:
                    time_of_ephemeris = row4[0][:18]
                    correction_inclination_cosine = row4[0][18:37]
                    OMEGA = row4[0][37:56]
                    correction_inclination_sine = row4[1]
            elif len(row4)==3:
                if len(row4[2]) == 18:
                    correction_inclination_sine = row4[2]
                    if len(row4[1])==18:
                        OMEGA = row4[1]
                        correction_inclination_cosine = row4[0][18:37]
                        time_of_ephemeris = row4[0][:18]
                    else:
                        OMEGA = row4[1][18:37]
                        correction_inclination_cosine = row4[1][:18]
                        time_of_ephemeris = row4[0]
                else:
                    time_of_ephemeris = row4[0]
                    correction_inclination_cosine = row4[1]
                    OMEGA = row4[2][:18]
                    correction_inclination_sine = row4[2][18:37]
            else:
                time_of_ephemeris = row4[0]
                correction_inclination_cosine = row4[1]
                OMEGA = row4[2]
                correction_inclination_sine = row4[3]

            row5 = list(filter(None, row5))
            inclination = row5[0]
            if len(row5[1]) == 18:
                correction_radius_cosine = row5[1]
                omega = row5[2][:18]
                OMEGA_dot = row5[2][18:]
            else:
                correction_radius_cosine = row5[1][:18]
                omega = row5[1][18:37]
                OMEGA_dot = row5[1][37:]

            row6 = list(filter(None, row6))
            inclination_rate = row6[0]
            codes = row6[1]
            gps_week = row6[2]
            l2_p_data_flag = row6[3]

            row7 = list(filter(None, row7))
            sv_accuracy = row7[0]
            iodc = row7[-1]
            if len(row7[1]) > 18:
                sv_health = row7[1][:18]
                tgd = row7[1][18:]
            else:
                sv_health = row7[1]
                tgd = row7[2]

            row8 = list(filter(None, row8))
            t_tx = row8[0]
            #    fit_interval = row8[1]
            fit_interval = '4.000000000000E+00'
            final_row = []
            final_row.append(PRN)
            final_row.append(epoch_time)
            final_row.append(sv_clock_bias)
            final_row.append(sv_clock_drift)
            final_row.append(sv_clock_drift_rate)
            final_row.append(IODE)
            final_row.append(correction_radius_sine)
            final_row.append(mean_motion_deln)
            final_row.append(mean_anomaly)
            final_row.append(correction_latitude_cosine )
            final_row.append(eccentricity)
            final_row.append(correction_latitude_sine)
            final_row.append(sqrt_semi_major_axis)
            final_row.append(time_of_ephemeris)
            final_row.append(correction_inclination_cosine)
            final_row.append(correction_inclination_sine)
            final_row.append(inclination)
            final_row.append(correction_radius_cosine)
            final_row.append(omega)
            final_row.append(OMEGA_dot)
            final_row.append(inclination_rate)
            final_row.append(codes)
            final_row.append(gps_week)
            final_row.append(l2_p_data_flag)
            final_row.append(sv_accuracy)
            final_row.append(sv_health)
            final_row.append(tgd)
            final_row.append(iodc)
            final_row.append(t_tx)
            final_row.append(fit_interval)
            csvwriter.writerow(final_row)

        csvfile.close()
