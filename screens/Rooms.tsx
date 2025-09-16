// screens/Rooms.tsx
import React, { useEffect, useState } from "react";
import type { JSX } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import axios from "axios";
import Modal from "react-native-modal";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import Header from "../navigation/Header";
import Footer from "../navigation/Footer";
import API from '../src/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
    { label: "Bachelor of Science in Electronics (BSECE)", value: "BSECE" },
    { label: "Bachelor of Science in Electrical (BSEE)", value: "BSEE" },
    { label: "Bachelor of Science in Computer (BSCoE)", value: "BSCoE" },
    { label: "Bachelor of Science in Information Systems (BSIS)", value: "BSIS" },
    { label: "Bachelor of Science in Information Tech (BSInfoTech)", value: "BSInfoTech" },
    { label: "Bachelor of Science in Computer Science (BSCS)", value: "BSCS" },
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
    { label: "Refrigeration & Aircon (BMET-RAC)", value: "BMET-RAC" },
    { label: "Architectural Drafting (BSIT-ADT)", value: "BSIT-ADT" },
    { label: "Automotive Technology (BSIT-AT)", value: "BSIT-AT" },
    { label: "Electrical Technology (BSIT-ELT)", value: "BSIT-ELT" },
    { label: "Electronics Technology (BSIT-ET)", value: "BSIT-ET" },
    { label: "Mechanical Technology (BSIT-MT)", value: "BSIT-MT" },
    { label: "Welding & Fabrication (BSIT-WAF)", value: "BSIT-WAF" },
    { label: "Heating, Ventilation, AC (BSIT-HVACR)", value: "BSIT-HVACR" },
  ],
  CAS: [
    { label: "Bachelor of Science in Environmental Science (BSES)", value: "BSES" },
    { label: "Bachelor of Science in Mathematics (BSMATH)", value: "BSMATH" },
    { label: "Bachelor of Arts in English Language (BA-EL)", value: "BA-EL" },
  ],
};

type PickerState = {
  type: "date" | "timeIn" | "timeOut" | "";
  visible: boolean;
};

type Room = {
  id: number;
  name: string;
  quantity: number;
};

type RoomBookingRequest = {
  name: string;
  borrower_id: string;
  year: string;
  department: string;
  course: string;
  date: string;
  time_in: string;
  time_out: string;
  room_id: number;
}

export default function Rooms(): JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  // Add auth check on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
      }
    };
    
    checkAuth();
  }, [navigation]);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  const [fullName, setFullName] = useState<string>("");
  const [idNumber, setIdNumber] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [course, setCourse] = useState<string>("");

  const [date, setDate] = useState<Date | null>(null);
  const [timeIn, setTimeIn] = useState<Date | null>(null);
  const [timeOut, setTimeOut] = useState<Date | null>(null);

  const [showPicker, setShowPicker] = useState<PickerState>({
    type: "",
    visible: false,
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Please login first');
        // Add navigation to login if needed
        return;
      }

      const response = await API.get('/rooms');
      setRooms(response.data);
    } catch (error: any) {
      console.error('Error fetching rooms:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        // Add navigation to login if needed
        return;
      }
      
      Alert.alert('Error', 'Failed to fetch rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openModal = (room: string) => {
    setSelectedRoom(room);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setShowPicker({ type: "", visible: false });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker({ type: "", visible: false });
    }
    if (selectedDate) setDate(selectedDate);
  };

  const handleTimeChange =
    (pickerType: "timeIn" | "timeOut") =>
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === "android") {
        setShowPicker({ type: "", visible: false });
      }
      if (selectedDate) {
        if (pickerType === "timeIn") setTimeIn(selectedDate);
        else setTimeOut(selectedDate);
      }
    };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!fullName || !idNumber || !year || !department || 
          !course || !date || !timeIn || !timeOut) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      // Find room ID from selected room name
      const room = rooms.find(r => r.name === selectedRoom);
      if (!room) {
        Alert.alert('Error', 'Room not found');
        return;
      }

      // Format the request data
      const requestData: RoomBookingRequest = {
        name: fullName,
        borrower_id: idNumber,
        year: year,
        department: department,
        course: course,
        date: date.toISOString().split('T')[0],
        time_in: timeIn.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }),
        time_out: timeOut.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }),
        room_id: room.id
      };

      // Submit the request
      const response = await API.post('/room-requests', requestData);

      if (response.status === 201) {
        Alert.alert('Success', 'Room booking request submitted successfully!');
        // Reset form
        setFullName('');
        setIdNumber('');
        setYear('');
        setDepartment('');
        setCourse('');
        setDate(null);
        setTimeIn(null);
        setTimeOut(null);
        // Close modal
        setModalVisible(false);
      }

    } catch (error: any) {
      console.error('Submit error:', {
        message: error.message,
        response: error.response?.data
      });
      
      // Show appropriate error message
      const errorMessage = error.response?.data?.message 
        || 'Failed to submit room booking request';
      Alert.alert('Error', errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007e3a" />
        <Text>Loading rooms...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#bbe0cd" }}>
      <Header />
      <View style={styles.body}>
        <Text style={styles.title}>Available Rooms</Text>

        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "center" }}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => openModal(item.name)}
            >
              <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
              <Text>Qty: {item.quantity}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No rooms available</Text>}
        />

        {/* Modal Form */}
        <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
          <View style={styles.modal}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Room Booking Request</Text>
            <Text style={styles.roomDisplay}>{selectedRoom}</Text>

            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              placeholder="ID Number"
              style={styles.input}
              value={idNumber}
              onChangeText={setIdNumber}
            />

            {/* Year Picker */}
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={year} onValueChange={(val) => setYear(val)}>
                <Picker.Item label="Select Year" value="" />
                {YEAR_OPTIONS.map((opt) => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>

            {/* Department Picker */}
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={department}
                onValueChange={(val) => {
                  setDepartment(val);
                  setCourse("");
                }}
              >
                <Picker.Item label="Select Department" value="" />
                {DEPT_OPTIONS.map((opt) => (
                  <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                ))}
              </Picker>
            </View>

            {/* Course Picker */}
            {department ? (
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={course} onValueChange={(val) => setCourse(val)}>
                  <Picker.Item label="Select Course" value="" />
                  {COURSE_OPTIONS[department].map((opt) => (
                    <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                  ))}
                </Picker>
              </View>
            ) : null}

            {/* Date & Time Pickers */}
            <TouchableOpacity
              onPress={() => setShowPicker({ type: "date", visible: true })}
              style={styles.input}
            >
              <Text>{date ? date.toDateString() : "Select Date"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPicker({ type: "timeIn", visible: true })}
              style={styles.input}
            >
              <Text>{timeIn ? timeIn.toLocaleTimeString() : "Select Time In"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPicker({ type: "timeOut", visible: true })}
              style={styles.input}
            >
              <Text>{timeOut ? timeOut.toLocaleTimeString() : "Select Time Out"}</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmit}
              >
                <Text style={{ color: "white" }}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={{ color: "black" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Native Pickers */}
        {showPicker.visible && showPicker.type === "date" && (
          <DateTimePicker
            mode="date"
            value={date ?? new Date()}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
          />
        )}
        {showPicker.visible &&
          (showPicker.type === "timeIn" || showPicker.type === "timeOut") && (
            <DateTimePicker
              mode="time"
              value={new Date()}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange(showPicker.type as "timeIn" | "timeOut")}
            />
          )}
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#bbe0cd",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 15,
  },
  item: {
    backgroundColor: "#fff",
    padding: 10,
    margin: 5,
    width: 130,
    height: 70,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  empty: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "gray",
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  roomDisplay: {
    fontWeight: "bold",
    color: "#007e3a",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: "#00a651",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
    elevation: 2, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  closeButton: {
    position: "absolute",
    right: 10,
    top: 5,
    zIndex: 99,
  },
  closeText: {
    fontSize: 24,
    color: "red",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
