import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from 'app/config/api-config';

function formatVND(amount) {
  const n = Number(amount) || 0;
  return n.toLocaleString('vi-VN') + ' đ';
}

function maskPhone(phone) {
  if (!phone) return '-';
  const s = String(phone).replace(/\s+/g, '');
  if (s.length <= 6) return s;
  const head = s.slice(0, 3);
  const tail = s.slice(-3);
  return `${head}${'*'.repeat(Math.max(0, s.length - 6))}${tail}`;
}

export default function MemberGroupDetailScreen(props) {
  const groupId = props.route?.params?.id;
  const groupName = props.route?.params?.name;
  const [stats, setStats] = useState({ members: [], total: 0 });

  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const res = await axios.get(`${apiConfig.BASE_URL}/member/groups/${groupId}/details`, { headers: { Authorization: `Bearer ${token}` }});
      setStats(res.data || { members: [], total: 0 });
    } catch (e) {
      setStats({ members: [], total: 0 });
    }
  };

  useEffect(() => {
    props.navigation.setOptions({
      title: 'Thông tin nhóm',
    });
    fetchStats();
  }, [groupId]);

  const renderItem = ({ item }) => (
    <View style={tw`bg-white border border-gray-100 rounded-xl px-4 py-3 mb-2`}> 
      <View style={tw`flex-row items-center justify-between`}>
        <Text style={tw`text-gray-800 font-semibold`} numberOfLines={1}>{item.name}</Text>
        <Text style={tw`text-cyan-600 font-medium`}>{formatVND(item.revenue)}</Text>
      </View>
      <Text style={tw`text-gray-500 mt-1`}>{maskPhone(item.phone)}</Text>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50 px-4 py-3`}>
      <View style={tw`mb-2`}>
        <Text style={tw`text-gray-700`}>Tên nhóm:</Text>
        <Text style={tw`text-gray-900 font-semibold`}>{groupName ? groupName : `Nhóm #${groupId}`}</Text>
      </View>
      <View style={tw`flex-row items-center justify-between mb-3`}>
        <Text style={tw`text-gray-700`}>Tổng doanh số nhóm:</Text>
        <Text style={tw`text-cyan-600 font-semibold`}>{formatVND(stats.total)}</Text>
      </View>
      <FlatList
        data={stats.members}
        keyExtractor={(it, idx) => String(it.userId || idx)}
        renderItem={renderItem}
      />
    </View>
  );
}


