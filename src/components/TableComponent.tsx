// https://query2.finance.yahoo.com/v1/finance/search?q=spy&lang=en-US&region=US&quotesCount=5&newsCount=0&listsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&multiQuoteQueryId=multi_quote_single_token_query&newsQueryId=news_cie_vespa&enableCb=false&enableNavLinks=true&enableEnhancedTrivialQuery=true&enableResearchReports=false&enableCulturalAssets=true&enableLogoUrl=true&enableLists=false&recommendCount=0&enablePrivateCompany=true
import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface TableData {
  [year: string]: (number | null)[];
}

interface TableComponentProps {
  data: TableData;
}

const TableComponent: React.FC<TableComponentProps> = ({ data }) => {
  const years = Object.keys(data).sort((a, b) => Number(b) - Number(a));
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  const getCellColor = (value: number | null): string => {
    if (value === null) return '#f5f5f5';
    return value > 0 ? '#e6f3ff' : '#ffe6e6';
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>연도</TableCell>
            {months.map((month) => (
              <TableCell key={month} align="center">{month}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {years.map((year) => (
            <TableRow key={year}>
              <TableCell component="th" scope="row">
                {year}
              </TableCell>
              {data[year].map((value, index) => (
                <TableCell 
                  key={`${year}-${index}`} 
                  align="center"
                  style={{ backgroundColor: getCellColor(value) }}
                >
                  {value !== null ? value.toFixed(2) : '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableComponent; 