import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    TextInput,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import tw from "twrnc";

/**
 * CategorySelector - A specialized selector for hierarchical categories
 *
 * @param {Object} props
 * @param {Array} props.categories - Array of category objects
 * @param {Array} props.selectedCategories - Array of selected category IDs
 * @param {function} props.onCategoriesChange - Callback with updated selected categories array
 * @param {boolean} props.required - Whether this field is required
 */
const CategorySelector = ({
                              categories = [],
                              selectedCategories = [],
                              onCategoriesChange,
                              required = false
                          }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredCategories, setFilteredCategories] = useState(categories);

    // Filter categories based on search text
    useEffect(() => {
        if (searchText.trim() === '') {
            setFilteredCategories(categories);
        } else {
            // This is a simple filter implementation
            // Helper function to search recursively
            const searchInCategory = (category) => {
                if (category.name.toLowerCase().includes(searchText.toLowerCase())) {
                    return true;
                }

                if (category.children && category.children.length > 0) {
                    return category.children.some(child => searchInCategory(child));
                }

                return false;
            };

            const filtered = categories.filter(category => searchInCategory(category));
            setFilteredCategories(filtered);
        }
    }, [searchText, categories]);

    // Render categories within the Modal
    const renderCategoryItem = (category, level = 0) => {
        return (
            <View key={category.id}>
                <TouchableOpacity
                    style={tw`flex-row items-center py-2 px-${level * 3}`}
                    onPress={() => {
                        // Toggle selection
                        if (selectedCategories.includes(category.id)) {
                            onCategoriesChange(selectedCategories.filter(id => id !== category.id));
                        } else {
                            onCategoriesChange([...selectedCategories, category.id]);
                        }
                    }}
                >
                    <Icon
                        name={selectedCategories.includes(category.id) ? "checkbox-marked" : "checkbox-blank-outline"}
                        size={20}
                        style={tw`${selectedCategories.includes(category.id) ? 'text-blue-500' : 'text-gray-500'} mr-2`}
                    />
                    <Text>{category.name}</Text>
                </TouchableOpacity>

                {category.children && category.children.length > 0 && (
                    <View style={tw`ml-3`}>
                        {category.children.map(child => renderCategoryItem(child, level + 1))}
                    </View>
                )}
            </View>
        );
    };

    // Render main view showing the current selection
    const renderSelectedView = () => {
        if (!categories || categories.length === 0) {
            return (
                <View style={tw`bg-gray-100 p-3 rounded-lg`}>
                    <Text style={tw`text-gray-500 text-center`}>Không có danh mục sản phẩm</Text>
                </View>
            );
        }

        return (
            <View style={tw`bg-white p-3 rounded-lg`}>
                {categories.map(category => renderCategoryItem(category))}
            </View>
        );
    };

    return (
        <View>
            {renderSelectedView()}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
                    <View style={tw`bg-white rounded-t-xl h-2/3`}>
                        <View style={tw`p-4 border-b border-gray-200 flex-row justify-between items-center`}>
                            <Text style={tw`text-lg font-bold`}>Chọn danh mục</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="close" size={24} style={tw`text-gray-700`} />
                            </TouchableOpacity>
                        </View>

                        {/* Search input */}
                        <View style={tw`px-4 py-2`}>
                            <View style={tw`flex-row items-center border border-gray-300 rounded-lg px-3`}>
                                <Icon name="magnify" size={20} style={tw`text-gray-500 mr-1`} />
                                <TextInput
                                    style={tw`flex-1 py-2`}
                                    placeholder="Tìm kiếm danh mục..."
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

                        {/* Selected categories count */}
                        <View style={tw`px-4 py-1 flex-row justify-between border-b border-gray-100`}>
                            <Text style={tw`text-gray-500`}>
                                Đã chọn: <Text style={tw`font-medium text-blue-600`}>{selectedCategories.length}</Text>
                            </Text>

                            {selectedCategories.length > 0 && (
                                <TouchableOpacity onPress={() => onCategoriesChange([])}>
                                    <Text style={tw`text-red-500`}>Bỏ chọn tất cả</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Scrollable category list */}
                        <ScrollView style={tw`max-h-96`}>
                            <View style={tw`px-4 py-2`}>
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map(category => renderCategoryItem(category))
                                ) : (
                                    <View style={tw`p-4 items-center justify-center`}>
                                        <Text style={tw`text-gray-500`}>Không tìm thấy danh mục phù hợp</Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        {/* Action buttons */}
                        <View style={tw`p-4 border-t border-gray-200 flex-row justify-end`}>
                            <TouchableOpacity
                                style={tw`px-5 py-2 bg-blue-500 rounded-lg`}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={tw`text-white font-medium`}>Xong</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CategorySelector;
