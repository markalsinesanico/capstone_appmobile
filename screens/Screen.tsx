// screens/Screen.tsx
import React, { useState } from 'react';
import type { JSX } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  ImageSourcePropType,
} from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';
import Header from '../navigation/Header';
import Footer from '../navigation/Footer';
import { Picker } from '@react-native-picker/picker';

type Item = {
  id: string;
  name: string;
  image: ImageSourcePropType;
};

const ITEMS: Item[] = [
  { id: '1', name: 'PROJECTOR', image: require('../assets/images/projector.png') as ImageSourcePropType },
  { id: '2', name: 'HDMI', image: require('../assets/images/hdmi.png') as ImageSourcePropType },
  { id: '3', name: 'SPEAKER', image: require('../assets/images/speaker.png') as ImageSourcePropType },
  { id: '4', name: 'REMOTE', image: require('../assets/images/remote.png') as ImageSourcePropType },
];

const YEAR_OPTIONS = [
  { label: '1st Year', value: '1st' },
  { label: '2nd Year', value: '2nd' },
  { label: '3rd Year', value: '3rd' },
  { label: '4th Year', value: '4th' },
];

const DEPT_OPTIONS = [
  { label: 'CEIT', value: 'CEIT' },
  { label: 'CTE', value: 'CTE' },
  { label: 'COT', value: 'COT' },
  { label: 'CAS', value: 'CAS' },
];

const COURSE_OPTIONS: Record<string, { label: string; value: string }[]> = {
  CEIT: [
    { label: 'Bachelor of Science in Electronics(BSECE)', value: 'BSECE' },
    { label: 'Bachelor of Science in Electrical(BSEE)', value: 'BSEE' },
    { label: 'Bachelor of Science in Computer(BSCoE)', value: 'BSCoE' },
    { label: 'Bachelor of Science in (BSIS)', value: 'BSIS' },
    { label: 'Bachelor of Science in (BSInfoTech)', value: 'BSInfoTech' },
    { label: 'Bachelor of Science in (BSCS)', value: 'BSCS' },
  ],
  CTE: [
    { label: 'BSED - English', value: 'BSED-ENGLISH' },
    { label: 'BSED - Filipino', value: 'BSED-FILIPINO' },
    { label: 'BSED - Mathematics', value: 'BSED-MATH' },
    { label: 'BSED - Sciences', value: 'BSED-SCIENCES' },
    { label: 'BEED', value: 'BEED' },
    { label: 'BPED', value: 'BPED' },
    { label: 'BTVTED', value: 'BTVTED' },
  ],
  COT: [
    { label: 'Bachelor in Electrical (BEET)', value: 'BEET' },
    { label: 'Bachelor in Electronics (BEXET)', value: 'BEXET' },
    { label: 'Bachelor in Mechanical (BMET)', value: 'BMET' },
    { label: 'Mechanical Technology (BMET-MT)', value: 'BMET-MT' },
    { label: 'Refrigeration & (BMET-RAC)', value: 'BMET-RAC' },
    { label: 'Architectural Drafting (BSIT-ADT)', value: 'BSIT-ADT' },
    { label: 'Automotive Technology (BSIT-AT)', value: 'BSIT-AT' },
    { label: 'Electrical Technology (BSIT-ELT)', value: 'BSIT-ELT' },
    { label: 'Electronics Technology (BSIT-ET)', value: 'BSIT-ET' },
    { label: 'Mechanical Technology (BSIT-MT)', value: 'BSIT-MT' },
    { label: 'Welding & Fabrication (BSIT-WAF)', value: 'BSIT-WAF' },
    { label: 'Heating, Ventilation, (BSIT-HVACR)', value: 'BSIT-HVACR' },
  ],
  CAS: [
    { label: 'Bachelor of Science in(BSES)', value: 'BSES' },
    { label: 'Bachelor of Science in (BSMATH)', value: 'BSMATH' },
    { label: 'Bachelor of Arts in (BA-EL)', value: 'BA-EL' },
  ],
};

type FormState = {
  fullName: string;
  idNumber: string;
  year: string;
  dept: string;
  course: string;
  date: Date | null;
  timeIn: Date | null;
  timeOut: Date | null;
};

type TimePickerState = {
  field: 'timeIn' | 'timeOut' | null;
  visible: boolean;
};

export default function Screen(): JSX.Element {
  const [search, setSearch] = useState<string>('');
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [form, setForm] = useState<FormState>({
    fullName: '',
    idNumber: '',
    year: '',
    dept: '',
    course: '',
    date: null,
    timeIn: null,
    timeOut: null,
  });
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<TimePickerState>({ field: null, visible: false });

  const openRequest = (name: string) => {
    setSelectedItem(name);
    setModalVisible(true);
  };

  const handleFormChange = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((s) => ({ ...s, [key]: val }));
  };

  const onDateChange = (_event: any, selectedDate?: Date | undefined) => {
    // hide date picker first
    setShowDatePicker(false);
    if (selectedDate) {
      handleFormChange('date', selectedDate);
    }
  };

  const onTimeChange = (field: 'timeIn' | 'timeOut') => (_event: any, selectedDate?: Date | undefined) => {
    setShowTimePicker({ field: null, visible: false });
    if (selectedDate) {
      handleFormChange(field, selectedDate);
    }
  };

  const submit = () => {
    // TODO: replace alert with your submit logic (api/sqlite/etc.)
    // keep the alert for now for quick confirmation
    alert('Request submitted!');
    setForm({
      fullName: '',
      idNumber: '',
      year: '',
      dept: '',
      course: '',
      date: null,
      timeIn: null,
      timeOut: null,
    });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.searchSection}>
        <TextInput
          placeholder="Search.."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        <FontAwesome name="bell" size={24} color="white" style={styles.bellIcon} />
      </View>

      <Text style={styles.sectionTitle}>Available Item</Text>

      <FlatList
        data={ITEMS.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={item.image} style={styles.itemImage} />
            <Text style={styles.itemName}>{item.name}</Text>
            <TouchableOpacity style={styles.itemButton} onPress={() => openRequest(item.name)}>
              <Text style={styles.itemButtonText}>Request ITEM</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
            <FontAwesome name="times" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Borrowing Request Form</Text>
          <Text style={styles.selectedItem}>{selectedItem}</Text>
          <ScrollView>
            <TextInput
              value={form.fullName}
              placeholder="Full Name"
              style={styles.input}
              onChangeText={(t) => handleFormChange('fullName', t)}
            />
            <TextInput
              value={form.idNumber}
              placeholder="ID Number"
              style={styles.input}
              onChangeText={(t) => handleFormChange('idNumber', t)}
            />
            <View style={styles.input}>
              <Picker
                selectedValue={form.year}
                onValueChange={(v) => handleFormChange('year', v)}
                dropdownIconColor="#007e3a"
                style={styles.picker}
              >
                <Picker.Item label="Select Year Level" value="" />
                {YEAR_OPTIONS.map((opt) => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>

            <View style={styles.input}>
              <Picker
                selectedValue={form.dept}
                onValueChange={(v) => {
                  handleFormChange('dept', v);
                  handleFormChange('course', ''); // reset course when dept changes
                }}
                dropdownIconColor="#007e3a"
                style={styles.picker}
              >
                <Picker.Item label="Select Department" value="" />
                {DEPT_OPTIONS.map((opt) => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>

            <View style={styles.input}>
              <Picker
                enabled={!!form.dept}
                selectedValue={form.course}
                onValueChange={(v) => handleFormChange('course', v)}
                dropdownIconColor="#007e3a"
                style={styles.picker}
              >
                <Picker.Item label="Select Course" value="" />
                {form.dept &&
                  COURSE_OPTIONS[form.dept] &&
                  COURSE_OPTIONS[form.dept].map((opt) => (
                    <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                  ))}
              </Picker>
            </View>

            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
              <Text style={{ color: form.date ? '#000' : '#888' }}>
                {form.date ? form.date.toDateString() : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.date ?? new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker({ field: 'timeIn', visible: true })}
            >
              <Text style={{ color: form.timeIn ? '#000' : '#888' }}>
                {form.timeIn ? form.timeIn.toLocaleTimeString() : 'Select Time In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker({ field: 'timeOut', visible: true })}
            >
              <Text style={{ color: form.timeOut ? '#000' : '#888' }}>
                {form.timeOut ? form.timeOut.toLocaleTimeString() : 'Select Time Out'}
              </Text>
            </TouchableOpacity>

            {showTimePicker.visible && showTimePicker.field && (
              <DateTimePicker
                value={
                  (showTimePicker.field === 'timeIn' ? form.timeIn : form.timeOut) ?? new Date()
                }
                mode="time"
                display="default"
                onChange={onTimeChange(showTimePicker.field)}
              />
            )}

            <View style={styles.submitRow}>
              <TouchableOpacity style={styles.submitBtn} onPress={submit}>
                <Text style={{ color: 'white' }}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bbe0cd',
  },
  searchSection: {
    margin: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 12,
  },
  bellIcon: {
    marginLeft: 15,
  },
  sectionTitle: {
    marginHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  item: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 7,
    padding: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    resizeMode: 'cover' as const,
  },
  itemName: {
    flex: 1,
    textAlign: 'center' as const,
    fontStyle: 'italic',
    fontSize: 16,
  },
  itemButton: {
    backgroundColor: '#00a651',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  itemButtonText: {
    color: 'white',
    fontSize: 12,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute' as const,
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center' as const,
  },
  selectedItem: {
    textAlign: 'center' as const,
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#007e3a',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  submitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#00a651',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 5,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ddd',
    alignItems: 'center',
    marginLeft: 5,
  },
  picker: {
    height: 45,
    color: '#333',
  },
});
