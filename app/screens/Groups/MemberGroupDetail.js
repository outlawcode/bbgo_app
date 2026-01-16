import React, { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import { Text } from 'app/components';
;
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import apiConfig from 'app/config/api-config';
import moment from 'moment';
import DateRangeSelect from 'app/components/DateRangeSelect';

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
  const [stats, setStats] = useState({ members: [], total: 0, canViewMembers: true });
  const [dateRange, setDateRange] = useState([
    moment().startOf('month'),
    moment().endOf('month'),
  ]);

  const fetchStats = async () => {
    if (!groupId) return;

    const hasRange = dateRange && dateRange[0] && dateRange[1];
    const params = hasRange
      ? {
          startDate: dateRange[0].format('YYYY-MM-DD'),
          endDate: dateRange[1].format('YYYY-MM-DD'),
        }
      : {};

    try {
      const token = await AsyncStorage.getItem('sme_user_token');
      const res = await axios.get(
        `${apiConfig.BASE_URL}/member/groups/${groupId}/details`,
        { params, headers: { Authorization: `Bearer ${token}` } },
      );
      const data = res.data || { members: [], total: 0 };
      // If members is empty array but total > 0, likely user doesn't have permission to view members
      // (server returns { total, members: [] } when user can't view details)
      const canViewMembers = !(data.members && Array.isArray(data.members) && data.members.length === 0 && data.total > 0);
      setStats({ ...data, canViewMembers, members: data.members || [] });
    } catch (e) {
      // Check if error is 403 (Forbidden) or similar permission error
      const canViewMembers = e.response?.status !== 403 && e.response?.status !== 401;
      setStats({ members: [], total: 0, canViewMembers });
    }
  };

  useEffect(() => {
    props.navigation.setOptions({
      title: 'Thông tin nhóm',
    });
  }, [props.navigation]);

  useEffect(() => {
    fetchStats();
  }, [groupId, dateRange]);

  const renderItem = ({ item }) => (
    <View style={tw`bg-white border border-gray-100 rounded-xl px-4 py-3 mb-2`}>
      <View style={tw`flex-row items-center justify-between`}>
        <Text style={tw`text-gray-800 font-semibold`} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={tw`text-cyan-600 font-medium`}>{formatVND(item.revenue)}</Text>
      </View>
      <Text style={tw`text-gray-500 mt-1`}>{maskPhone(item.phone)}</Text>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <FlatList
        data={stats.members}
        keyExtractor={(it, idx) => String(it.userId || idx)}
        renderItem={renderItem}
        contentContainerStyle={tw`px-4 py-3`}
        ListHeaderComponent={
          <>
            {/* Tên nhóm Section */}
            <View style={tw`bg-white rounded-xl px-4 py-3 mb-3`}>
              <Text style={tw`text-gray-700 mb-1`}>Tên nhóm:</Text>
              <Text style={tw`text-gray-900 font-semibold text-lg`}>
                {groupName ? groupName : `Nhóm #${groupId}`}
              </Text>
            </View>

            {/* Khoảng thời gian Section */}
            <View style={tw`bg-white rounded-xl px-4 py-3 mb-3`}>
              <Text style={tw`text-gray-700 mb-2`}>Khoảng thời gian:</Text>
              <DateRangeSelect dateRange={dateRange} onSetRange={setDateRange} />
            </View>

            {/* Tổng doanh số Section */}
            <View style={tw`bg-white rounded-xl px-4 py-3 mb-3`}>
              <View style={tw`flex-row items-center justify-between`}>
                <Text style={tw`text-gray-700`}>Tổng doanh số nhóm:</Text>
                <Text style={tw`text-cyan-600 font-semibold text-lg`}>
                  {formatVND(stats.total)}
                </Text>
              </View>
            </View>

            {/* Thành viên Section */}
            {stats.canViewMembers ? (
              <View style={tw`bg-blue-50 rounded-lg px-4 py-2 mb-3`}>
                <Text style={tw`text-blue-700 font-semibold text-base`}>
                  Danh sách thành viên
                </Text>
              </View>
            ) : (
              <View style={tw`bg-white rounded-xl px-4 py-3 mb-3`}>
                <Text style={tw`text-gray-600 text-center`}>
                  Bạn không được xem danh sách thành viên của nhóm này
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          stats.canViewMembers && stats.members.length === 0 ? (
            <View style={tw`bg-white rounded-xl px-4 py-3`}>
              <Text style={tw`text-gray-500 text-center`}>Chưa có thành viên</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}


