import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    TextInput,
    ActivityIndicator,
    Platform
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";

/**
 * CustomSelector - A reusable dropdown selector component for React Native
 *
 * @param {Object} props
 * @param {string} props.label - Label text to display above the selector
 * @param {string} props.placeholder - Placeholder text when no item is selected
 * @param {string} props.value - Currently selected value
 * @param {function} props.onValueChange - Callback when value changes (value, index)
 * @param {Array} props.items - Array of items to select from
 * @param {function} props.getLabel - Function to get label from item (optional)
 * @param {function} props.getValue - Function to get value from item (optional)
 * @param {boolean} props.loading - Whether the items are loading
 * @param {boolean} props.searchable - Whether to show search input
 * @param {boolean} props.required - Whether this field is required
 * @param {string} props.error - Error message to display
 * @param {Object} props.containerStyle - Additional styles for container
 */
const CustomSelector = ({
                            label,
                            placeholder = "Chọn một mục",
                            value,
                            onValueChange,
                            items = [],
                            getLabel = item => typeof item === 'string' ? item : item.name || item.label,
                            getValue = item => typeof item === 'string' ? item : item.id || item.value,
                            loading = false,
                            searchable = false,
                            required = false,
                            error,
                            containerStyle = {}
                        }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredItems, setFilteredItems] = useState(items);

    // Update filtered items when search text or items change
    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredItems(items);
        } else {
            const filtered = items.filter(item =>
                getLabel(item).toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    }, [searchText, items, getLabel]);

    // Find selected item based on value prop
    const selectedItem = items.find(item => {
        const itemValue = getValue(item);
        return value !== undefined && itemValue !== undefined && itemValue === value;
    });

    const selectedLabel = selectedItem ? getLabel(selectedItem) : null;

    const handleSelect = (item, index) => {
        const itemValue = getValue(item);
        // Call onValueChange with the item's value
        onValueChange(itemValue, index);
        setModalVisible(false);
        setSearchText('');
    };

    return (
        <View style={containerStyle}>
            {label && (
                <Text style={tw`text-gray-600 mb-2`}>
                    {label} {required && <Text style={tw`text-red-500`}>*</Text>}
                </Text>
            )}

            <TouchableOpacity
                style={tw`border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg p-3 flex-row justify-between items-center bg-white`}
                onPress={() => setModalVisible(true)}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                    <Text
                        style={tw`${selectedLabel ? 'text-black' : 'text-gray-500'} flex-1`}
                        numberOfLines={1}
                    >
                        {selectedLabel || placeholder}
                    </Text>
                )}
                <Icon name="chevron-down" size={20} style={tw`text-gray-600`} />
            </TouchableOpacity>

            {error && (
                <Text style={tw`text-red-500 text-xs mt-1`}>{error}</Text>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
                    <View style={tw`bg-white rounded-t-xl ${Platform.OS === 'ios' ? 'h-2/3' : 'max-h-5/6'}`}>
                        <View style={tw`p-4 border-b border-gray-200 flex-row justify-between items-center`}>
                            <Text style={tw`text-lg font-bold`}>{label || "Chọn một mục"}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} style={tw`text-gray-700`} />
                            </TouchableOpacity>
                        </View>

                        {searchable && (
                            <View style={tw`px-4 py-2`}>
                                <View style={tw`flex-row items-center border border-gray-300 rounded-lg px-3`}>
                                    <Icon name="magnify" size={20} style={tw`text-gray-500 mr-1`} />
                                    <TextInput
                                        style={tw`flex-1 py-2`}
                                        placeholder="Tìm kiếm..."
                                        value={searchText}
                                        onChangeText={setSearchText}
                                    />
                                    {searchText ? (
                                        <TouchableOpacity onPress={() => setSearchText('')}>
                                            <Icon name="close-circle" size={18} style={tw`text-gray-500`} />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            </View>
                        )}

                        {loading ? (
                            <View style={tw`p-4 items-center justify-center`}>
                                <ActivityIndicator size="large" color="#3b82f6" />
                            </View>
                        ) : (
                            <FlatList
                                data={filteredItems}
                                keyExtractor={(item, index) => `${getValue(item)}-${index}`}
                                renderItem={({ item, index }) => {
                                    const itemValue = getValue(item);
                                    const isSelected = value !== undefined &&
                                        itemValue !== undefined &&
                                        itemValue === value;

                                    return (
                                        <TouchableOpacity
                                            style={tw`p-4 border-b border-gray-100 ${isSelected ? 'bg-blue-50' : ''}`}
                                            onPress={() => handleSelect(item, index)}
                                        >
                                            <Text style={tw`${isSelected ? 'text-blue-600 font-medium' : 'text-gray-800'}`}>
                                                {getLabel(item)}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}
                                ListEmptyComponent={
                                    <View style={tw`p-4 items-center justify-center`}>
                                        <Text style={tw`text-gray-500`}>Không tìm thấy kết quả</Text>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CustomSelector;
