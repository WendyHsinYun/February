<template lang="pug">
v-row.mt-7.ml-6.justify-space-between
  v-col(cols='auto')
    span.header.font-weight-bold.text-primaryText Contacts
  v-col(cols='auto')
    v-row
      v-col(cols='auto' width='160px')
        ButtonSecondary(:click="exportFile" :text='"Export data"' color="background" :prependIcon='"mdi-export"' height='53')
      v-col(cols='auto' width='160px')
        ButtonPrimary(:text='"Add data"' :prependIcon='"mdi-plus"' height='53' )

v-row.ml-6
  v-col(cols='12')
    Table(
      :rawData='tableData' 
      v-model='selected' 
      :level='level'
      :selectAll='selectAll' 
      @onSelectAll='onSelectAll'
      @onLevelSelected='onLevelSelected')

PopupLevel(
  v-if='levelPopup' 
  v-model='levelPopup' 
  :customers='customers'
  :level='level'
  @submit='onLevelChanged'
  @close='close()')
</template>

<script setup>
import _ from 'lodash'
import dayjs from 'dayjs';
import { utils, writeFileXLSX } from 'xlsx';

const tableData = ref(customerData)

const levelPopup = ref(false)

const selected = ref([])

const selectAll = ref(false)
const level = ref(null)

const customers = computed(()=>{
  const array = []

  for(const [key, value] of Object.entries(tableData.value)){
    if(selected.value.includes(key)){
      array.push(value.name)
    }
  }

  return array
})

const onLevelSelected = (value) => {
  level.value = value
  levelPopup.value = true
}

const onSelectAll = (newValue) => {
  selectAll.value = !selectAll.value
  selected.value = newValue ? Object.keys(tableData.value) : []
}

watch(selected, (newValue)=>{
    selectAll.value = selected.value.length === Object.keys(tableData.value).length ? true : false
})

const onLevelChanged = () => {
  const copies = { ...tableData.value }

  for(const [key, value] of Object.entries(copies)){

    if(selected.value.includes(key)){
      value.level = level.value
    }
  }
  tableData.value = copies

  levelPopup.value = false
  level.value = null
  selected.value = []
}

const close = () => {
  levelPopup.value = false
  level.value = null
}

const exportFile = () => {
  const data = formatSheet(tableData.value)
  const ws = utils.json_to_sheet(data);
  const wb = utils.book_new();
  const now = dayjs().format('YYYY-MM-DD')

  utils.book_append_sheet(wb, ws, "sheet1");
  writeFileXLSX(wb, `${now}_sheet.xlsx`);
} 

</script>

<style lang="sass">
.header
  font-size: 32px
</style>
