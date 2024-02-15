import dayjs from 'dayjs';
import _ from 'lodash'

export const formatTimestamp = (v: number) => {
  return dayjs(v * 1000).format('YYYY-MM-DD HH:mm:ss');
};

interface TableValue {
  tags?: string[] | string;
}

export const formatSheet = (tableData: Record<string, TableValue>) => {
  const data = Object.values(tableData)

  for(const value of data){
    if(_.isArray(value.tags)){
      value.tags = value.tags.join(', ')
    }
  }
  
  return data
}