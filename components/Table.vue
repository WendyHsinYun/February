<template lang="pug">
v-card(color="background" variant="outlined" style='border: 1px solid #D0D0D0')
  v-row(no-gutters).align-center.justify-space-between
    v-col(cols='3').d-flex.align-center.py-2.ms-4
      InputSearch(v-model='search' :placeholder='"search contacts"' :prependIcon='true' :clearable='true')
        v-icon(color='secondaryText') mdi-magnify

    v-col(cols='4').d-flex.align-center.py-2.justify-space-around
      v-row
        v-col.d-flex.align-center
          p
            span.text-primaryText select {{ Object.keys(modelValue).length }}
            span.text-secondaryText.ms-1 of {{ Object.keys(tableData).length }} customers

        v-col.me-7(style='min-width: 150px')
          Selector(
            :model-value="level"
            :clearable="clearable"
            @update:modelValue='onLevelSelected'
            :items="levels"
            :disabled="disabled"
            placeholder="Change level"
            )
      
  v-table
    thead.pe-2
      tr
        th(width='2.5%') 
          v-checkbox-btn(
            :model-value="selectAll" 
            @update:modelValue="onSelectedAll")
        th(width='4.5%').text-center #
        th(width='10%' @click='sortTable("name")' style='cursor: pointer') 
          p.d-flex.align-center
            span name 
            div(v-if='sortedColumn.column !== "name"')
              v-icon(size='14') mdi-unfold-more-horizontal
            div(v-else-if='sortedColumn.order')
              v-icon(size='14') mdi-arrow-up-thin
            div(v-else)
              v-icon(size='14') mdi-arrow-down-thin

        th(width='8%') email
        th(width='10%') phone
        th(width='10%') address

        th(width='10%' @click='sortTable("register")' style='cursor: pointer')          
          p.d-flex.align-center
            span register time
            div(v-if='sortedColumn.column !== "register" ')
              v-icon(size='14') mdi-unfold-more-horizontal
            div(v-else-if='sortedColumn.order')
              v-icon(size='14') mdi-arrow-up-thin
            div(v-else)
              v-icon(size='14') mdi-arrow-down-thin
        th(width='10%' @click='sortTable("login")'  style='cursor: pointer')          
          p.d-flex.align-center
            span last login
            div(v-if='sortedColumn.column !== "login" ')
              v-icon(size='14') mdi-unfold-more-horizontal
            div(v-else-if='sortedColumn.order')
              v-icon(size='14') mdi-arrow-up-thin
            div(v-else)
              v-icon(size='14') mdi-arrow-down-thin
        th(width='10%' @click='sortTable("level")' style='cursor: pointer')          
          p.d-flex.align-center
            span customer level
            div(v-if='sortedColumn.column !== "level"')
              v-icon(size='14') mdi-unfold-more-horizontal
            div(v-else-if='sortedColumn.order')
              v-icon(size='14') mdi-arrow-up-thin
            div(v-else)
              v-icon(size='14') mdi-arrow-down-thin
        th(width='5%')

    tbody
      tr(v-for='(value, key, i) of tableData' :key='key')
        td(width='2.5%')
          v-checkbox-btn(
            :model-value="modelValue"
            @update:modelValue="onSelected"
            :value="key")
        td(width='4.5%').text-center
          span {{ i+1 }}
        td(width='10%').pe-4
          span {{ value.name }}
        td(width='8%')
          span {{ value.email }}
        td(width='10%')
          span {{ value.phone }}
        td(width='10%' @click='expandAddress(key)' style='cursor: pointer')
          p.d-flex.justify-space-between.align-center
            span {{ expandRows[key] ? value.address : value.address.substr(0, 10) }}
            v-icon(size='12') mdi-chevron-down
        td(width='10%')
          span {{ formatTimestamp(value.register) }}
        td(width='10%')
          span {{ formatTimestamp(value.login) }}
        td(width='10%')
          span {{ value.level }}
        td(width='5%').text-center
</template>

<script setup>
import _ from 'lodash'
import { watch } from 'vue';

const props = defineProps({
  rawData : {
    type: Object,
    default: () => {},
  },
  modelValue : {
    type: Array,
    default: () => [],
  },
  selectAll : {
    type: Boolean,
    default: false,
  },
  level : {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'onSelectAll', 'onLevelSelected']);

const clearable = ref(true)

const search = ref('')
const tableData = ref(props.rawData)

const customers = ref([])

const onSelected = (value) => {
  emit('update:modelValue', value)
}

const onSelectedAll = (value) => {
  emit('onSelectAll', value);
}

const disabled = computed(()=>{
  return props.modelValue.length === 0
})

const onLevelSelected = (value) => {
  emit('onLevelSelected', value);
}

const searchResult = ref({})

const expandRows = ref({})

const expandAddress = (key) => { 
  if(key in expandRows.value){
    expandRows.value[key] = !expandRows.value[key]
  }else{
    expandRows.value[key] = true 
  }
}

watch(expandRows, (newValue)=>{console.log(newValue)}, {deep: true})

const sortedColumn = ref({ column: null, order: 0 });

const sortNumber = ([ ,a], [ ,b])=>{
  const order = sortedColumn.value.order
  const col = sortedColumn.value.column
  
  if(order === 1){
    return Number(a[col]) - Number(b[col]) 
  }else{
    return Number(b[col]) - Number(a[col])
  }
}

const sortString = ([ ,a], [ ,b]) => {
  const order = sortedColumn.value.order;
  const col = sortedColumn.value.column

  if (order === 1) {
    return a[col].localeCompare(b[col]);
  } else {
    return b[col].localeCompare(a[col]);
  }
};

const sortTable = (col) => {
  if (sortedColumn.value.column === col) {
    sortedColumn.value.order = 1 - sortedColumn.value.order;
  } else {
    sortedColumn.value = { column: col, order: 0 };
  }

  const entries = Object.entries(tableData.value)

  if(col === 'name' || 'level' ){
    entries.sort(sortString)
  }else{
    entries.sort(sortNumber)
  }

  const sortedObject = Object.fromEntries(entries)
  tableData.value = sortedObject
}

const searchContact = (value) => {
  searchResult.value = {} 

  const regex = new RegExp(value, 'i');

  for(const [entriesKey, entriesValue] of Object.entries(customerData)){
    
    for(const [key, value] of Object.entries(entriesValue)){
      const searchValue = []

      if(key !== 'register' || 'login' ){
        searchValue.push(value)
      }

      const searchString = JSON.stringify([...searchValue])
      
      if(regex.test(searchString)){
        searchResult.value[entriesKey] = entriesValue
      }
    }
  }
  tableData.value = searchResult.value;
}

const debounce = _.debounce((value) => {
  searchContact(value);
}, 500);

watch(search, (newValue) => {
  if (newValue) {
    debounce(newValue);
  } else {
    debounce.cancel();
    tableData.value = { ...customerData }    
  }
})


</script>

<style lang="sass">
thead
  background-color: $background
  border: 1px solid $line
</style>