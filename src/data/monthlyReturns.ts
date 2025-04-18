const monthlyReturns: Record<string, number[]> = {'2025': [2.7, -1.42, -5.75, 1.05],
    '2024': [1.59,
     5.17,
     3.1,
     -4.16,
     4.8,
     3.47,
     1.13,
     2.28,
     2.02,
     -0.99,
     5.73,
     -2.5],
    '2023': [6.18,
     -2.61,
     3.51,
     1.46,
     0.25,
     6.47,
     3.11,
     -1.77,
     -4.87,
     -2.2,
     8.92,
     4.42],
    '2022': [-5.26,
     -3.14,
     3.58,
     -8.8,
     0.01,
     -8.39,
     9.11,
     -4.24,
     -9.34,
     7.99,
     5.38,
     -5.9],
    '2021': [-1.11,
     2.61,
     4.24,
     5.24,
     0.55,
     2.22,
     2.27,
     2.9,
     -4.76,
     6.91,
     -0.83,
     4.36],
    '2020': [-0.16,
     -8.41,
     -12.51,
     12.68,
     4.53,
     1.84,
     5.51,
     7.01,
     -3.92,
     -2.77,
     10.75,
     3.71],
    '2019': [7.87,
     2.97,
     1.79,
     3.93,
     -6.58,
     6.89,
     1.31,
     -1.81,
     1.72,
     2.04,
     3.4,
     2.86],
    '2018': [5.62,
     -3.89,
     -2.69,
     0.27,
     2.16,
     0.48,
     3.6,
     3.03,
     0.43,
     -6.94,
     1.79,
     -9.18],
    '2017': [1.79,
     3.72,
     -0.04,
     0.91,
     1.16,
     0.48,
     1.93,
     0.05,
     1.93,
     2.22,
     2.81,
     0.98],
    '2016': [-5.07,
     -0.41,
     6.6,
     0.27,
     1.53,
     0.09,
     3.56,
     -0.12,
     -0.12,
     -1.94,
     3.42,
     1.82],
    '2015': [-3.1,
     5.49,
     -1.74,
     0.85,
     1.05,
     -2.1,
     1.97,
     -6.26,
     -2.64,
     8.3,
     0.05,
     -1.75],
    '2014': [-3.56,
     4.31,
     0.69,
     0.62,
     2.1,
     1.91,
     -1.51,
     3.77,
     -1.55,
     2.32,
     2.45,
     -0.42],
    '2013': [5.04,
     1.11,
     3.6,
     1.81,
     2.07,
     -1.5,
     4.94,
     -3.13,
     2.97,
     4.46,
     2.81,
     2.36],
    '2012': [4.36,
     4.06,
     3.13,
     -0.75,
     -6.27,
     3.96,
     1.26,
     1.98,
     2.42,
     -1.98,
     0.28,
     0.71],
    '2011': [2.27,
     3.2,
     -0.11,
     2.85,
     -1.35,
     -1.83,
     -2.14,
     -5.68,
     -7.18,
     10.77,
     -0.5,
     0.85],
    '2010': [-3.69,
     2.85,
     5.88,
     1.48,
     -8.2,
     -5.39,
     6.88,
     -4.75,
     8.76,
     3.69,
     -0.24,
     6.53],
    '2009': [-8.56,
     -10.99,
     8.54,
     9.39,
     5.3,
     0.02,
     7.42,
     3.35,
     3.58,
     -1.98,
     5.73,
     1.78],
    '2008': [-6.12,
     -3.47,
     -0.59,
     4.76,
     1.07,
     -8.6,
     -0.98,
     1.22,
     -9.07,
     -16.94,
     -7.49,
     0.78],
    '2007': [1.4,
     -2.18,
     1.0,
     4.33,
     3.25,
     -1.78,
     -3.19,
     1.28,
     3.58,
     1.48,
     -4.41,
     -0.86],
    '2006': [2.55,
     0.05,
     1.1,
     1.22,
     -3.09,
     0.01,
     0.51,
     2.12,
     2.45,
     3.15,
     1.65,
     1.26],
    '2005': [-2.52,
     1.89,
     -1.91,
     -2.02,
     3.0,
     -0.02,
     3.6,
     -1.13,
     0.7,
     -1.77,
     3.52,
     -0.1],
    '2004': [1.73,
     1.22,
     -1.63,
     -1.68,
     1.21,
     1.79,
     -3.43,
     0.23,
     0.94,
     1.4,
     3.86,
     3.25],
    '2003': [-2.74,
     -1.71,
     0.84,
     8.1,
     5.09,
     1.13,
     1.62,
     1.79,
     -1.19,
     5.49,
     0.71,
     5.07],
    '2002': [-1.56,
     -2.08,
     3.68,
     -6.14,
     -0.91,
     -7.24,
     -7.9,
     0.49,
     -11.0,
     8.65,
     5.7,
     -6.03],
    '2001': [3.46,
     -9.23,
     -6.42,
     7.69,
     0.5,
     -2.5,
     -1.08,
     -6.41,
     -8.18,
     1.82,
     7.52,
     0.75],
    '2000': [-5.08,
     -2.02,
     9.68,
     -3.08,
     -2.19,
     2.39,
     -1.64,
     6.07,
     -5.35,
     -0.49,
     -8.0,
     0.4],
    '1999': [4.1,
     -3.23,
     3.88,
     3.79,
     -2.5,
     5.45,
     -3.21,
     -0.62,
     -2.86,
     6.25,
     1.91,
     5.78],
    '1998': [1.02,
     7.04,
     5.0,
     0.91,
     -1.89,
     3.94,
     -1.16,
     -14.58,
     6.24,
     8.03,
     5.91,
     5.64],
    '1997': [6.14,
     0.59,
     -4.26,
     5.84,
     5.87,
     4.34,
     7.82,
     -5.74,
     5.31,
     -3.45,
     4.46,
     1.57],
    '1996': [3.26,
     0.69,
     0.8,
     1.35,
     2.28,
     0.22,
     -4.56,
     1.88,
     5.41,
     2.62,
     7.33,
     -2.15],
    '1995': [2.42,
     3.61,
     2.73,
     2.8,
     3.63,
     2.14,
     3.18,
     -0.04,
     4.0,
     -0.5,
     4.11,
     1.73],
    '1994': [3.26,
     -3.01,
     -4.56,
     1.14,
     1.24,
     -2.67,
     3.15,
     3.75,
     -2.69,
     2.1,
     -3.96,
     1.23],
    '1993': [0.71,
     1.05,
     1.87,
     -2.55,
     2.27,
     0.07,
     -0.53,
     3.46,
     -1.01,
     1.94,
     -1.28,
     1.0],
    '1992': [-1.99,
     0.95,
     -2.18,
     2.77,
     0.12,
     -1.76,
     3.95,
     -2.4,
     0.92,
     0.22,
     3.03,
     1.0],
    '1991': [4.15,
     6.75,
     2.21,
     0.05,
     3.84,
     -4.77,
     4.47,
     1.96,
     -1.9,
     1.19,
     -4.41,
     11.17],
    '1990': [-6.88,
     0.85,
     2.41,
     -2.68,
     9.19,
     -0.89,
     -0.53,
     -9.41,
     -5.11,
     -0.69,
     5.99,
     2.48],
    '1989': [7.13,
     -2.89,
     2.08,
     4.98,
     3.52,
     -0.78,
     8.84,
     1.53,
     -0.65,
     -2.49,
     1.65,
     2.14],
    '1988': [4.05,
     4.16,
     -3.32,
     0.93,
     0.34,
     4.31,
     -0.55,
     -3.86,
     3.98,
     2.61,
     -1.9,
     1.46],
    '1987': [13.17,
     3.68,
     2.64,
     -1.13,
     0.59,
     4.79,
     4.84,
     3.48,
     -2.43,
     -21.75,
     -8.54,
     7.29],
    '1986': [0.24,
     7.13,
     5.29,
     -1.42,
     5.01,
     1.42,
     -5.86,
     7.12,
     -8.54,
     5.49,
     2.13,
     -2.81],
    '1985': [7.42,
     0.89,
     -0.28,
     -0.5,
     5.45,
     1.16,
     -0.47,
     -1.2,
     -3.45,
     4.23,
     6.53,
     4.5],
    '1984': [-0.91,
     -3.86,
     1.34,
     0.57,
     -5.93,
     1.73,
     -1.63,
     10.62,
     -0.36,
     0.0,
     -1.51,
     2.2],
    '1983': [3.34,
     1.93,
     3.31,
     7.45,
     -1.22,
     3.51,
     -3.27,
     1.11,
     1.03,
     -1.51,
     1.71,
     -0.9],
    '1982': [-1.79,
     -6.06,
     -0.97,
     3.93,
     -3.87,
     -2.06,
     -2.28,
     11.58,
     0.75,
     11.05,
     3.59,
     1.52],
    '1981': [-4.57,
     1.31,
     3.58,
     -2.35,
     -0.15,
     -1.06,
     -0.23,
     -6.19,
     -5.37,
     4.91,
     3.61,
     -2.93],
    '1980': [5.84,
     -0.44,
     -10.2,
     4.11,
     4.61,
     2.7,
     6.57,
     0.58,
     2.53,
     1.59,
     10.2,
     -3.35],
    '1979': [3.95, -3.6, 5.5, 0.2, -2.65, 3.83, 0.87, 5.3, 0.0, -6.86, 4.32, 1.6],
    '1978': [-6.2,
     -2.47,
     2.53,
     8.52,
     0.41,
     -1.75,
     5.45,
     2.58,
     -0.77,
     -9.07,
     1.61,
     1.48],
    '1977': [-5.12,
     -2.16,
     -1.4,
     0.0,
     -2.34,
     4.58,
     -1.69,
     -2.02,
     -0.31,
     -4.35,
     2.71,
     0.32],
    '1976': [11.86,
     -1.19,
     3.11,
     -1.17,
     -1.38,
     4.09,
     -0.86,
     -0.48,
     2.24,
     -2.19,
     -0.78,
     5.29],
    '1975': [12.24,
     5.97,
     2.21,
     4.68,
     4.47,
     4.39,
     -6.72,
     -2.14,
     -3.45,
     6.08,
     2.47,
     -1.1],
    '1974': [-0.92,
     -0.41,
     -2.29,
     -3.94,
     -3.32,
     -1.49,
     -7.79,
     -8.95,
     -12.05,
     16.38,
     -5.28,
     -2.0],
    '1973': [-1.69,
     -3.71,
     -0.18,
     -4.04,
     -1.87,
     -0.67,
     3.74,
     -3.7,
     4.03,
     -0.09,
     -11.36,
     1.56],
    '1972': [1.76,
     2.6,
     0.56,
     0.47,
     1.67,
     -2.19,
     0.28,
     3.45,
     -0.54,
     1.0,
     4.57,
     1.11],
    '1971': [4.01,
     0.94,
     3.62,
     3.69,
     -4.23,
     0.1,
     -4.11,
     3.56,
     -0.71,
     -4.17,
     -0.21,
     8.62],
    '1970': [0.0,
    5.29,
     0.11,
     -9.04,
     -6.13,
     -4.97,
     7.29,
     4.49,
     3.31,
     -1.19,
     4.81,
     5.73]};
     
export default monthlyReturns;