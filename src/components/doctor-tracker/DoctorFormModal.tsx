"use client";

import { useState } from "react";
import { Form, Input, Modal } from "antd";
import { toast } from "sonner";
import { applyFormErrors, getErrorMessage } from "@/lib/errors";
import { PHONE_MESSAGE, PHONE_PATTERN } from "@/lib/validation";
import {
  Doctor,
  DoctorInput,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
} from "@/redux/service/admin/doctorApi";

const DOCTOR_FIELDS = ["name", "specialization", "hospital", "phone", "email"] as const;

interface DoctorFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When provided the modal edits this doctor, otherwise it creates one. */
  doctor?: Doctor;
  onSaved?: (doctor: Doctor) => void;
}

export default function DoctorFormModal({ open, onClose, doctor, onSaved }: DoctorFormModalProps) {
  const [form] = Form.useForm<DoctorInput>();
  const [createDoctor] = useCreateDoctorMutation();
  const [updateDoctor] = useUpdateDoctorMutation();
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(doctor);

  const handleFinish = async (values: DoctorInput) => {
    setSaving(true);
    try {
      const result = doctor
        ? await updateDoctor({ id: doctor.id, body: values }).unwrap()
        : await createDoctor(values).unwrap();
      toast.success(isEdit ? "Doctor updated" : "Doctor added");
      onSaved?.(result.data);
      onClose();
    } catch (error) {
      if (!applyFormErrors(form, error, DOCTOR_FIELDS)) toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit doctor" : "Add doctor"}
      open={open}
      onCancel={onClose}
      okText={isEdit ? "Save changes" : "Add doctor"}
      onOk={() => form.submit()}
      confirmLoading={saving}
      destroyOnHidden
      maskClosable={false}
    >
      <Form<DoctorInput>
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={doctor ? { ...doctor } : undefined}
        onFinish={handleFinish}
        className="pt-2"
      >
        <Form.Item
          name="name"
          label="Full name"
          rules={[
            { required: true, whitespace: true, message: "Enter the doctor's name" },
            { max: 100, message: "Use 100 characters or fewer" },
          ]}
        >
          <Input placeholder="Dr. Ayesha Rahman" autoComplete="off" />
        </Form.Item>

        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="specialization"
            label="Specialization"
            rules={[
              { required: true, whitespace: true, message: "Enter a specialization" },
              { max: 80, message: "Use 80 characters or fewer" },
            ]}
          >
            <Input placeholder="Cardiology" autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="hospital"
            label="Hospital"
            rules={[
              { required: true, whitespace: true, message: "Enter a hospital" },
              { max: 120, message: "Use 120 characters or fewer" },
            ]}
          >
            <Input placeholder="City General Hospital" autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "Enter a phone number" },
              { pattern: PHONE_PATTERN, message: PHONE_MESSAGE },
            ]}
          >
            <Input placeholder="+880 1700 000000" inputMode="tel" autoComplete="off" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Enter an email address" },
              { type: "email", message: "Enter a valid email address" },
            ]}
          >
            <Input placeholder="doctor@hospital.com" inputMode="email" autoComplete="off" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
