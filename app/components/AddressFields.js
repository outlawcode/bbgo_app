import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';

// Import local data files
import provincesData from '../data/provinces.json';
import districtsData from '../data/districts.json';
import wardsData from '../data/wards.json';

const AddressFields = ({ 
  currentData = {}, 
  onProvinceChange, 
  onDistrictChange, 
  onWardChange,
  showLabels = true 
}) => {
  const [provinces, setProvinces] = useState(provincesData || []);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [provinceId, setProvinceId] = useState(null);
  const [districtId, setDistrictId] = useState(null);
  const [wardId, setWardId] = useState(null);

  // Modal states
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);
  
  // Search states
  const [provinceSearch, setProvinceSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');


  // Initialize from currentData
  useEffect(() => {
    if (currentData.provinceCode) {
      const province = provinces.find(p => p.code === currentData.provinceCode);
      if (province) {
        setProvinceId(province.id);
        // Load districts for this province
        const provinceDistricts = districtsData.filter(d => d.provinceId === province.id);
        setDistricts(provinceDistricts);
      }
    }
    
    if (currentData.districtCode) {
      const district = districtsData.find(d => d.code === currentData.districtCode);
      if (district) {
        setDistrictId(district.id);
        // Load wards for this district
        const districtWards = wardsData.filter(w => w.districtId === district.id);
        setWards(districtWards);
      }
    }
    
    if (currentData.wardCode) {
      const ward = wardsData.find(w => w.code === currentData.wardCode);
      if (ward) {
        setWardId(ward.id);
      }
    }
  }, [currentData]);

  // Handle province selection
  const handleProvinceChange = (selectedProvince) => {
    setProvinceId(selectedProvince.id);
    setDistrictId(null);
    setWardId(null);
    setDistricts([]);
    setWards([]);
    
    // Load districts for selected province
    const provinceDistricts = districtsData.filter(d => d.provinceId === selectedProvince.id);
    setDistricts(provinceDistricts);
    
    // Emit change
    if (onProvinceChange) {
      onProvinceChange({
        id: selectedProvince.id,
        code: selectedProvince.code,
        name: selectedProvince.name
      });
    }
  };

  // Handle district selection
  const handleDistrictChange = (selectedDistrict) => {
    setDistrictId(selectedDistrict.id);
    setWardId(null);
    setWards([]);
    
    // Load wards for selected district
    const districtWards = wardsData.filter(w => w.districtId === selectedDistrict.id);
    setWards(districtWards);
    
    // Emit change
    if (onDistrictChange) {
      onDistrictChange({
        id: selectedDistrict.id,
        code: selectedDistrict.code,
        name: selectedDistrict.name
      });
    }
  };

  // Handle ward selection
  const handleWardChange = (selectedWard) => {
    setWardId(selectedWard.id);
    
    // Emit change
    if (onWardChange) {
      onWardChange({
        id: selectedWard.id,
        code: selectedWard.code,
        name: selectedWard.name
      });
    }
  };

  // Filtered data based on search
  const filteredProvinces = provinces.filter(province => 
    province.name.toLowerCase().includes(provinceSearch.toLowerCase())
  );
  
  const filteredDistricts = districts.filter(district => 
    district.name.toLowerCase().includes(districtSearch.toLowerCase())
  );
  
  const filteredWards = wards.filter(ward => 
    ward.name.toLowerCase().includes(wardSearch.toLowerCase())
  );

  const showProvincePicker = () => {
    if (!provinces || provinces.length === 0) return;
    setProvinceSearch('');
    setShowProvinceModal(true);
  };

  const showDistrictPicker = () => {
    if (!districts || districts.length === 0) return;
    setDistrictSearch('');
    setShowDistrictModal(true);
  };

  const showWardPicker = () => {
    if (!wards || wards.length === 0) return;
    setWardSearch('');
    setShowWardModal(true);
  };

  const closeModals = () => {
    setShowProvinceModal(false);
    setShowDistrictModal(false);
    setShowWardModal(false);
    setProvinceSearch('');
    setDistrictSearch('');
    setWardSearch('');
  };

  // Show loading state if data is not ready
  if (!provinces || provinces.length === 0) {
    return (
      <View style={tw`p-4`}>
        <Text style={tw`text-gray-500 text-center`}>Đang tải dữ liệu địa chỉ...</Text>
      </View>
    );
  }

  // Render item for FlatList
  const renderItem = ({ item, onSelect, isSelected }) => (
    <TouchableOpacity
      onPress={() => onSelect(item)}
      style={tw`px-4 py-3 border-b border-gray-100 ${isSelected ? 'bg-cyan-50' : 'bg-white'}`}
    >
      <Text style={tw`text-gray-800 ${isSelected ? 'font-semibold text-cyan-700' : ''}`}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      {/* Province Selection */}
      <View style={tw`mb-4`}>
        {showLabels && (
          <Text style={tw`text-gray-700 text-sm font-medium mb-2`}>
            Tỉnh/Thành phố *
          </Text>
        )}
        <TouchableOpacity
          onPress={showProvincePicker}
          style={tw`border border-gray-300 rounded-lg p-3 bg-white flex flex-row items-center justify-between`}
        >
          <Text style={tw`text-gray-700`}>
            {provinces.find(p => p.id === provinceId)?.name || "Chọn tỉnh/thành phố"}
          </Text>
          <Icon name="chevron-down" size={20} style={tw`text-gray-500`} />
        </TouchableOpacity>
      </View>

      {/* District Selection - Only show if province is selected */}
      {provinceId && (
        <View style={tw`mb-4`}>
          {showLabels && (
            <Text style={tw`text-gray-700 text-sm font-medium mb-2`}>
              Quận/Huyện *
            </Text>
          )}
          <TouchableOpacity
            onPress={showDistrictPicker}
            style={tw`border border-gray-300 rounded-lg p-3 bg-white flex flex-row items-center justify-between`}
          >
            <Text style={tw`text-gray-700`}>
              {districts.find(d => d.id === districtId)?.name || "Chọn quận/huyện"}
            </Text>
            <Icon name="chevron-down" size={20} style={tw`text-gray-500`} />
          </TouchableOpacity>
        </View>
      )}

      {/* Ward Selection - Only show if district is selected */}
      {districtId && (
        <View style={tw`mb-4`}>
          {showLabels && (
            <Text style={tw`text-gray-700 text-sm font-medium mb-2`}>
              Xã/Phường/Thị trấn *
            </Text>
          )}
          <TouchableOpacity
            onPress={showWardPicker}
            style={tw`border border-gray-300 rounded-lg p-3 bg-white flex flex-row items-center justify-between`}
          >
            <Text style={tw`text-gray-700`}>
              {wards.find(w => w.id === wardId)?.name || "Chọn xã/phường/thị trấn"}
            </Text>
            <Icon name="chevron-down" size={20} style={tw`text-gray-500`} />
          </TouchableOpacity>
        </View>
      )}

      {/* Province Selection Modal */}
      <Modal
        visible={showProvinceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModals}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
          <View style={tw`bg-white rounded-t-xl max-h-5/6`}>
            {/* Header */}
            <View style={tw`px-4 py-3 border-b border-gray-200 flex flex-row items-center justify-between`}>
              <Text style={tw`font-bold text-lg text-gray-800`}>Chọn Tỉnh/Thành phố</Text>
              <TouchableOpacity onPress={closeModals}>
                <Icon name="close" size={24} style={tw`text-gray-600`} />
              </TouchableOpacity>
            </View>
            
            {/* Search */}
            <View style={tw`px-4 py-3 border-b border-gray-100`}>
              <View style={tw`flex flex-row items-center border border-gray-300 rounded-lg px-3 py-2`}>
                <Icon name="magnify" size={20} style={tw`text-gray-500 mr-2`} />
                <TextInput
                  style={tw`flex-1 text-gray-700`}
                  placeholder="Tìm kiếm tỉnh/thành phố..."
                  value={provinceSearch}
                  onChangeText={setProvinceSearch}
                />
              </View>
            </View>
            
            {/* List */}
            <FlatList
              data={filteredProvinces}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderItem({
                item,
                onSelect: (selectedProvince) => {
                  handleProvinceChange(selectedProvince);
                  closeModals();
                },
                isSelected: item.id === provinceId
              })}
              style={tw`max-h-96`}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </View>
      </Modal>

      {/* District Selection Modal */}
      <Modal
        visible={showDistrictModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModals}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
          <View style={tw`bg-white rounded-t-xl max-h-5/6`}>
            {/* Header */}
            <View style={tw`px-4 py-3 border-b border-gray-200 flex flex-row items-center justify-between`}>
              <Text style={tw`font-bold text-lg text-gray-800`}>Chọn Quận/Huyện</Text>
              <TouchableOpacity onPress={closeModals}>
                <Icon name="close" size={24} style={tw`text-gray-600`} />
              </TouchableOpacity>
            </View>
            
            {/* Search */}
            <View style={tw`px-4 py-3 border-b border-gray-100`}>
              <View style={tw`flex flex-row items-center border border-gray-300 rounded-lg px-3 py-2`}>
                <Icon name="magnify" size={20} style={tw`text-gray-500 mr-2`} />
                <TextInput
                  style={tw`flex-1 text-gray-700`}
                  placeholder="Tìm kiếm quận/huyện..."
                  value={districtSearch}
                  onChangeText={setDistrictSearch}
                />
              </View>
            </View>
            
            {/* List */}
            <FlatList
              data={filteredDistricts}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderItem({
                item,
                onSelect: (selectedDistrict) => {
                  handleDistrictChange(selectedDistrict);
                  closeModals();
                },
                isSelected: item.id === districtId
              })}
              style={tw`max-h-96`}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </View>
      </Modal>

      {/* Ward Selection Modal */}
      <Modal
        visible={showWardModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModals}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
          <View style={tw`bg-white rounded-t-xl max-h-5/6`}>
            {/* Header */}
            <View style={tw`px-4 py-3 border-b border-gray-200 flex flex-row items-center justify-between`}>
              <Text style={tw`font-bold text-lg text-gray-800`}>Chọn Xã/Phường/Thị trấn</Text>
              <TouchableOpacity onPress={closeModals}>
                <Icon name="close" size={24} style={tw`text-gray-600`} />
              </TouchableOpacity>
            </View>
            
            {/* Search */}
            <View style={tw`px-4 py-3 border-b border-gray-100`}>
              <View style={tw`flex flex-row items-center border border-gray-300 rounded-lg px-3 py-2`}>
                <Icon name="magnify" size={20} style={tw`text-gray-500 mr-2`} />
                <TextInput
                  style={tw`flex-1 text-gray-700`}
                  placeholder="Tìm kiếm xã/phường/thị trấn..."
                  value={wardSearch}
                  onChangeText={setWardSearch}
                />
              </View>
            </View>
            
            {/* List */}
            <FlatList
              data={filteredWards}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderItem({
                item,
                onSelect: (selectedWard) => {
                  handleWardChange(selectedWard);
                  closeModals();
                },
                isSelected: item.id === wardId
              })}
              style={tw`max-h-96`}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddressFields;
