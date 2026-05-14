// 列表页面模板
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message } from 'antd';
import { get{{ModelName}}List, delete{{ModelName}} } from '@/api/{{modelName}}';
import {{ModelName}}Form from './components/{{ModelName}}Form';
import SearchForm from './components/SearchForm';

const {{ModelName}}List: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const columns = [
    // {{columns_generated_from_model}}
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <a onClick={() => { setEditRecord(record); setModalVisible(true); }}>编辑</a>
          <a onClick={() => handleDelete(record.id)}>删除</a>
        </Space>
      ),
    },
  ];

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await get{{ModelName}}List(params);
      setData(res.data.items);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await delete{{ModelName}}(id);
    message.success('删除成功');
    fetchData();
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      <SearchForm onSearch={fetchData} />
      <Button type="primary" onClick={() => { setEditRecord(null); setModalVisible(true); }}>
        新增
      </Button>
      <Table columns={columns} dataSource={data} loading={loading} />
      <Modal
        title={editRecord ? '编辑' : '新增'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <{{ModelName}}Form record={editRecord} onSuccess={() => { setModalVisible(false); fetchData(); }} />
      </Modal>
    </div>
  );
};

export default {{ModelName}}List;
