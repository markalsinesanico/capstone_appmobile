// screens/Screen.tsx
import React, { useEffect, useState } from "react";
import type { JSX } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome } from "@expo/vector-icons";
import Header from "../navigation/Header";
import Footer from "../navigation/Footer";
import { Picker } from "@react-native-picker/picker";
import API from '../src/api';

// ----------- Interfaces / Types ----------
interface Item {
  id: number;
  name: string;
  qty: number;
  description: string | null;
  image_url: string | null;
}

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
  field: "timeIn" | "timeOut" | null;
  visible: boolean;
};

// ----------- Options ----------
const YEAR_OPTIONS = [
  { label: "1st Year", value: "1st" },
  { label: "2nd Year", value: "2nd" },
  { label: "3rd Year", value: "3rd" },
  { label: "4th Year", value: "4th" },
];

const DEPT_OPTIONS = [
  { label: "CEIT", value: "CEIT" },
  { label: "CTE", value: "CTE" },
  { label: "COT", value: "COT" },
  { label: "CAS", value: "CAS" },
];

const COURSE_OPTIONS: Record<string, { label: string; value: string }[]> = {
  CEIT: [
    { label: "Bachelor of Science in Electronics(BSECE)", value: "BSECE" },
    { label: "Bachelor of Science in Electrical(BSEE)", value: "BSEE" },
    { label: "Bachelor of Science in Computer(BSCoE)", value: "BSCoE" },
    { label: "Bachelor of Science in (BSIS)", value: "BSIS" },
    { label: "Bachelor of Science in (BSInfoTech)", value: "BSInfoTech" },
    { label: "Bachelor of Science in (BSCS)", value: "BSCS" },
  ],
  CTE: [
    { label: "BSED - English", value: "BSED-ENGLISH" },
    { label: "BSED - Filipino", value: "BSED-FILIPINO" },
    { label: "BSED - Mathematics", value: "BSED-MATH" },
    { label: "BSED - Sciences", value: "BSED-SCIENCES" },
    { label: "BEED", value: "BEED" },
    { label: "BPED", value: "BPED" },
    { label: "BTVTED", value: "BTVTED" },
  ],
  COT: [
    { label: "Bachelor in Electrical (BEET)", value: "BEET" },
    { label: "Bachelor in Electronics (BEXET)", value: "BEXET" },
    { label: "Bachelor in Mechanical (BMET)", value: "BMET" },
    { label: "Mechanical Technology (BMET-MT)", value: "BMET-MT" },
    { label: "Refrigeration & (BMET-RAC)", value: "BMET-RAC" },
    { label: "Architectural Drafting (BSIT-ADT)", value: "BSIT-ADT" },
    { label: "Automotive Technology (BSIT-AT)", value: "BSIT-AT" },
    { label: "Electrical Technology (BSIT-ELT)", value: "BSIT-ELT" },
    { label: "Electronics Technology (BSIT-ET)", value: "BSIT-ET" },
    { label: "Mechanical Technology (BSIT-MT)", value: "BSIT-MT" },
    { label: "Welding & Fabrication (BSIT-WAF)", value: "BSIT-WAF" },
    { label: "Heating, Ventilation, (BSIT-HVACR)", value: "BSIT-HVACR" },
  ],
  CAS: [
    { label: "Bachelor of Science in(BSES)", value: "BSES" },
    { label: "Bachelor of Science in (BSMATH)", value: "BSMATH" },
    { label: "Bachelor of Arts in (BA-EL)", value: "BA-EL" },
  ],
};

// ----------- Screen ----------
export default function Screen(): JSX.Element {
  const [search, setSearch] = useState<string>("");
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
const [selectedItemName, setSelectedItemName] = useState<string>("");
const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    idNumber: "",
    year: "",
    dept: "",
    course: "",
    date: null,
    timeIn: null,
    timeOut: null,
  });
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<TimePickerState>({
    field: null,
    visible: false,
  });

  // API items
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

const fetchItems = async () => {
  try {
    setLoading(true);
    const response = await API.get('/items');
    
    if (response.status === 401) {
      // Handle unauthorized
      console.log('Unauthorized - redirecting to login');
      // Add your navigation logic here
      return;
    }
    
    setItems(response.data);
} catch (error: any) {
  console.error("Fetch error details:", {
    message: error.message ?? "Unknown error",
    name: error.name ?? "No name",
  });

  Alert.alert(
    "Error",
    "Failed to fetch items. Please check your connection and try again."
  );
} finally {
  setLoading(false);
}
};
  useEffect(() => {
    fetchItems();
  }, []);

 const openRequest = (item: Item) => {
  setSelectedItemName(item.name);
  setSelectedItemId(item.id);
  setModalVisible(true);
};
  const handleFormChange = <K extends keyof FormState>(
    key: K,
    val: FormState[K]
  ) => {
    setForm((s) => ({ ...s, [key]: val }));
  };

  const onDateChange = (_event: any, selectedDate?: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleFormChange("date", selectedDate);
    }
  };

  const onTimeChange =
    (field: "timeIn" | "timeOut") =>
    (_event: any, selectedDate?: Date | undefined) => {
      setShowTimePicker({ field: null, visible: false });
      if (selectedDate) {
        handleFormChange(field, selectedDate);
      }
    };

  const submit = async () => {
    try {
      if (!selectedItemId) {
        Alert.alert('Error', 'Please select an item');
        return;
      }

      // Format time to HH:mm format
      const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      const requestData = {
        name: form.fullName,
        borrower_id: form.idNumber,
        year: form.year,
        department: form.dept,
        course: form.course,
        date: form.date?.toISOString().split('T')[0],
        time_in: form.timeIn ? formatTime(form.timeIn) : null,
        time_out: form.timeOut ? formatTime(form.timeOut) : null,
        item_id: selectedItemId
      };

      // Log the request data for debugging
      console.log('Submitting request:', requestData);

      const response = await API.post('/requests', requestData);

      console.log('Response:', response.data);

      Alert.alert('Success', 'Request submitted successfully!');
      setModalVisible(false);
      resetForm();

    } catch (error: any) {
      console.error('Submit error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || 'Failed to submit request';
        
      Alert.alert('Error', errorMessage);
    }
  };

  const resetForm = () => {
    setForm({
      fullName: '',
      idNumber: '',
      year: '',
      dept: '',
      course: '',
      date: null,
      timeIn: null,
      timeOut: null
    });
    setSelectedItemId(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007e3a" />
        <Text>Loading items...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.searchSection}>
        <TextInput
          placeholder="Search.."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        <FontAwesome
          name="bell"
          size={24}
          color="white"
          style={styles.bellIcon}
        />
      </View>

      <Text style={styles.sectionTitle}>📦 Available Items</Text>

      <FlatList
        data={items.filter((i) =>
          i.name.toLowerCase().includes(search.toLowerCase())
        )}
        keyExtractor={(i) => i.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, styles.noImage]}>
                <Text style={{ color: "#888" }}>No Image</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={{ fontSize: 12, color: "green" }}>
                 available
              </Text>
              {item.description ? (
                <Text style={{ fontSize: 11, color: "#555" }}>
                  {item.description}
                </Text>
              ) : null}
            </View>
           <TouchableOpacity
  style={styles.itemButton}
  onPress={() => openRequest(item)}
>
  <Text style={styles.itemButtonText}>Request ITEM</Text>
</TouchableOpacity>
          </View>
        )}
      />

      {/* Borrow Modal */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        useNativeDriver
        hideModalContentWhileAnimating
      >
        <View style={styles.modal}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <FontAwesome name="times" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Borrowing Request Form</Text>
          <Text style={styles.selectedItem}>{selectedItemName}</Text>
          <ScrollView>
            <TextInput
              value={form.fullName}
              placeholder="Full Name"
              style={styles.input}
              onChangeText={(t) => handleFormChange("fullName", t)}
            />
            <TextInput
              value={form.idNumber}
              placeholder="ID Number"
              style={styles.input}
              onChangeText={(t) => handleFormChange("idNumber", t)}
            />
            <View style={styles.input}>
              <Picker
                selectedValue={form.year}
                onValueChange={(v) => handleFormChange("year", v)}
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
                  handleFormChange("dept", v);
                  handleFormChange("course", "");
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
                onValueChange={(v) => handleFormChange("course", v)}
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

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.input}
            >
              <Text style={{ color: form.date ? "#000" : "#888" }}>
                {form.date ? form.date.toDateString() : "Select Date"}
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
              onPress={() => setShowTimePicker({ field: "timeIn", visible: true })}
            >
              <Text style={{ color: form.timeIn ? "#000" : "#888" }}>
                {form.timeIn
  ? form.timeIn.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  : "Select Time In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.input}
              onPress={() =>
                setShowTimePicker({ field: "timeOut", visible: true })
              }
            >
              <Text style={{ color: form.timeOut ? "#000" : "#888" }}>
                {form.timeOut
  ? form.timeOut.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  : "Select Time Out"}
              </Text>
            </TouchableOpacity>

            {showTimePicker.visible && showTimePicker.field && (
              <DateTimePicker
                value={
                  (showTimePicker.field === "timeIn"
                    ? form.timeIn
                    : form.timeOut) ?? new Date()
                }
                mode="time"
                display="default"
                onChange={onTimeChange(showTimePicker.field)}
              />
            )}

            <View style={styles.submitRow}>
              <TouchableOpacity style={styles.submitBtn} onPress={submit}>
                <Text style={{ color: "white" }}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelBtn}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Footer />
    </SafeAreaView>
  );
}

// ----------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#bbe0cd",
  },
  searchSection: {
    margin: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "white",
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
    fontWeight: "bold",
  },
  item: {
    backgroundColor: "white",
    marginHorizontal: 15,
    marginVertical: 7,
    padding: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: "cover",
  },
  noImage: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemButton: {
    backgroundColor: "#00a651",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  itemButtonText: {
    color: "white",
    fontSize: 12,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    maxHeight: "90%",
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  selectedItem: {
    textAlign: "center",
    marginVertical: 10,
    fontWeight: "bold",
    color: "#007e3a",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  submitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: "#00a651",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 5,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ddd",
    alignItems: "center",
    marginLeft: 5,
  },
  picker: {
    height: 45,
    color: "#333",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
