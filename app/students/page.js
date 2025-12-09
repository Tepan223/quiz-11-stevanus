'use client';
import "@ant-design/v5-patch-for-react-19";
import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
  message,
  Spin,
  Switch,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';



export default function StudentsCRUD() {
  const [students, setStudents] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [form] = Form.useForm();

  const [submitLoading, setSubmitLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());

  const [searchText, setSearchText] = useState('');
  const [simulateError, setSimulateError] = useState(false);

  const maybeSimulateError = (operationName = '') => {
    if (!simulateError) return;
    if (Math.random() < 0.4) {
      throw new Error(`Simulated error (${operationName})`);
    }
  };

  const fetchStudents = async () => {
    setTableLoading(true);
    try {
      maybeSimulateError('fetch');

      const res = await fetch('/api/students');
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchStudents error:', err);
      message.error('Gagal memuat data siswa.');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openAddModal = () => {
    form.resetFields();
    setIsEditing(false);
    setEditingStudent(null);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    form.setFieldsValue({
      name: record.name,
      age: record.age,
      className: record.className,
      ...record,
    });
    setIsEditing(true);
    setEditingStudent(record);
    setModalOpen(true);
  };

  const createStudent = async (values) => {
    setSubmitLoading(true);
    try {
      maybeSimulateError('create');

      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `HTTP ${res.status}`);
      }
      message.success('Siswa berhasil ditambahkan.');
      setModalOpen(false);
      form.resetFields();
      await fetchStudents();
    } catch (err) {
      console.error('createStudent error:', err);
      message.error('Gagal menambahkan siswa.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const updateStudent = async (id, values) => {
    setSubmitLoading(true);
    try {
      maybeSimulateError('update');

      const res = await fetch(`/api/students/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `HTTP ${res.status}`);
      }
      message.success('Data siswa berhasil diperbarui.');
      setModalOpen(false);
      setEditingStudent(null);
      form.resetFields();
      await fetchStudents();
    } catch (err) {
      console.error('updateStudent error:', err);
      message.error('Gagal memperbarui siswa.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const deleteStudent = async (id) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      maybeSimulateError('delete');

      const res = await fetch(`/api/students/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `HTTP ${res.status}`);
      }
      message.success('Siswa berhasil dihapus.');
      await fetchStudents();
    } catch (err) {
      console.error('deleteStudent error:', err);
      message.error('Gagal menghapus siswa.');
    } finally {
      setDeletingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEditing && editingStudent && (editingStudent.id != null || editingStudent._id != null)) {
        const id = editingStudent.id ?? editingStudent._id;
        await updateStudent(id, values);
      } else {
        await createStudent(values);
      }
    } catch (err) {
      console.log('Modal submit error', err);
    }
  };

  const columns = [
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Usia',
      dataIndex: 'age',
      key: 'age',
      width: 100,
      sorter: (a, b) => (a.age || 0) - (b.age || 0),
    },
    {
      title: 'Kelas',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 180,
      render: (_, record) => {
        const id = record.id ?? record._id ?? record.key;
        const deleting = deletingIds.has(id);
        return (
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              size="small"
            >
              Edit
            </Button>
            <Popconfirm
              title="Hapus data ini?"
              onConfirm={() => deleteStudent(id)}
              okText="Ya"
              cancelText="Batal"
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                loading={deleting}
              >
                Hapus
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const filteredStudents = useMemo(() => {
    const q = (searchText || '').trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => (s.name || '').toLowerCase().includes(q));
  }, [students, searchText]);

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Manajemen Siswa (CRUD)</h2>

        <Space align="center">
          <span style={{ marginRight: 8 }}>
            Simulate Error
          </span>
          <Switch
            checked={simulateError}
            onChange={(v) => {
              setSimulateError(v);
              message.info(v ? 'Simulasi error diaktifkan' : 'Simulasi error dimatikan');
            }}
          />
        </Space>
      </Space>

      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Input.Search
            placeholder="Cari nama siswa..."
            allowClear
            onSearch={(val) => setSearchText(val)}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            value={searchText}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            Tambah Siswa
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchStudents}>
            Muat Ulang
          </Button>
        </Space>

        <div style={{ color: 'rgba(0,0,0,0.45)' }}>
          {filteredStudents.length} siswa ditampilkan
        </div>
      </Space>

      <Spin spinning={tableLoading}>
        <Table
          dataSource={filteredStudents.map((s, i) => ({
            key: s.id ?? s._id ?? `${s.name ?? 'row'}-${i}`,
            ...s,
          }))}
          columns={columns}
          rowKey={(record) => record.id ?? record._id ?? record.key}
          pagination={{ pageSize: 8 }}
        />
      </Spin>

      <Modal
        title={isEditing ? 'Edit Siswa' : 'Tambah Siswa'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setModalOpen(false);
          setEditingStudent(null);
          form.resetFields();
        }}
        confirmLoading={submitLoading}
        okText={isEditing ? 'Simpan Perubahan' : 'Tambah'}
      >
        <Form form={form} layout="vertical" initialValues={{ age: 16 }}>
          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: 'Masukkan nama' }]}
          >
            <Input placeholder="Nama siswa" />
          </Form.Item>

          <Form.Item
            name="age"
            label="Usia"
            rules={[{ required: true, message: 'Masukkan usia' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={150} />
          </Form.Item>

          <Form.Item
            name="className"
            label="Kelas"
            rules={[{ required: true, message: 'Masukkan kelas' }]}
          >
            <Input placeholder="contoh: 10A / XI IPA" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
