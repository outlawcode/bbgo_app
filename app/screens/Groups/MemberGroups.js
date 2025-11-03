import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from 'app/config/api-config';

export default function MemberGroupsScreen(props) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const res = await axios.get(`${apiConfig.BASE_URL}/member/groups`, { headers: { Authorization: `Bearer ${token}` }});
      const data = Array.isArray(res.data) ? res.data : [];
      const normalized = data.map((it) => it.group ? it.group : it);
      setGroups(normalized);
    } catch (e) {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    props.navigation.setOptions({
      title: 'Nhóm của tôi',
    });
    fetchGroups();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={tw`mb-3 bg-white border border-gray-200 rounded-xl px-4 py-3`}
      activeOpacity={0.7}
      onPress={() => props.navigation.navigate('MemberGroupDetail', { id: item.id, name: item.name })}
    >
      <View style={tw`flex-row items-center justify-between mb-1`}>
        <View style={tw`flex-row items-center`}>
          <Icon name="account-group" size={18} style={tw`text-cyan-600 mr-2`} />
          <Text style={tw`text-gray-800 font-semibold`}>{item.name || `Nhóm #${item.id}`}</Text>
        </View>
        <Icon name="chevron-right" size={18} style={tw`text-gray-400`} />
      </View>
      <View style={tw`flex-row items-center`}>
        <Icon name="account-multiple-outline" size={16} style={tw`text-gray-500 mr-1`} />
        <Text style={tw`text-gray-600`}>Thành viên: <Text style={tw`font-semibold`}>{item.memberCount ?? item.membersCount ?? item.totalMembers ?? 0}</Text></Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-gray-50 px-4 py-3`}>
      <FlatList
        data={groups}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchGroups} />}
        ListEmptyComponent={!loading ? (
          <View style={tw`py-10 items-center`}>
            <Text style={tw`text-gray-500`}>Bạn chưa tham gia nhóm nào</Text>
          </View>
        ) : null}
      />
    </View>
  );
}


