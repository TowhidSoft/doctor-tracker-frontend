"use client";

import { useState } from "react";
import { Form, Input, InputNumber, Modal, Select } from "antd";
import { toast } from "sonner";
import { applyFormErrors, getErrorMessage } from "@/lib/errors";
import { GENDERS, PHONE_MESSAGE, PHONE_PATTERN } from "@/lib/validation";
import { PatientInput, useAddPatientToDoctorMutation } from "@/redux/service/admin/doctorApi";
import { Patient, useUpdatePatientMutation } from "@/redux/service/admin/patientApi";

const PATIENT_FIELDS = ["name", "age", "gender", "phone", "email", "condition", "notes", "doctorId"] as const;

interface FormValues extends Omit<PatientInput, "email" | "notes"> {
  email?: string;
  notes?: string;
  doctorId?: string;
}

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Create mode: add a patient under this doctor. */
  doctorId?: string;
  /** Edit mode: the patient being edited. */
  patient?: Patient;
  /** Edit mode: doctors the patient can be reassigned to. */
  doctorOptions?: { label: string; value: string }[];
}

export default function PatientFormModal({ open, onClose, doctorId, patient, doctorOptions = [] }: PatientFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [addPatient] = useAddPatientToDoctorMutation();
  const [updatePatient] = useUpdatePatientMutation();
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(patient);

  const handleFinish = async ({ doctorId: nextDoctorId, email, notes, ...rest }: FormValues) => {
    const body: PatientInput = { ...rest, email: email?.trim() || null, notes: notes?.trim() || null };
    setSaving(true);
    try {
      if (patient) {
        await updatePatient({ id: patient.id, body: { ...body, doctorId: nextDoctorId } }).unwrap();
        toast.success("Patient updated");
      } else if (doctorId) {
        await addPatient({ doctorId, body }).unwrap();
        toast.success("Patient added");
      }
      onClose();
    } catch (error) {
      if (!applyFormErrors(form, error, PATIENT_FIELDS)) toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const initialValues: Partial<FormValues> | undefined = patient
    ? {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email ?? undefined,
        condition: patient.condition,
        notes: patient.notes ?? undefined,
        doctorId: patient.doctorId,
      }
    : undefined;

  return (
    <Modal
      title={isEdit ? "Edit patient" : "Add patient"}
      open={open}
      onCancel={onClose}
      okText={isEdit ? "Save changes" : "Add patient"}
      onOk={() => form.submit()}
      confirmLoading={saving}
      destroyOnHidden
      maskClosable={false}
    >
      <Form<FormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={initialValues}
        onFinish={handleFinish}
        className="pt-2"
      >
        <Form.Item
          name="name"
          label="Full name"
          rules={[
            { required: true, whitespace: true, message: "Enter the patient's name" },
            { max: 100, message: "Use 100 characters or fewer" },
          ]}
        >
          <Input placeholder="Karim Hossain" autoComplete="off" />
        </Form.Item>

        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="age"
            label="Age"
            rules={[
              { required: true, message: "Enter an age" },
              { type: "number", min: 1, max: 120, message: "Age must be between 1 and 120" },
            ]}
          >
            <InputNumber min={1} max={120} precision={0} className="!w-full" inputMode="numeric" />
          </Form.Item>
          <Form.Item name="gender" label="Gender" rules={[{ required: true, message: "Select a gender" }]}>
            <Select placeholder="Select gender" options={GENDERS.map((g) => ({ label: g, value: g }))} />
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
          <Form.Item name="email" label="Email (optional)" rules={[{ type: "email", message: "Enter a valid email address" }]}>
            <Input placeholder="patient@example.com" inputMode="email" autoComplete="off" />
          </Form.Item>
        </div>

        <Form.Item
          name="condition"
          label="Condition"
          rules={[
            { required: true, whitespace: true, message: "Enter the patient's condition" },
            { max: 120, message: "Use 120 characters or fewer" },
          ]}
        >
          <Input placeholder="Hypertension" autoComplete="off" />
        </Form.Item>

        {isEdit && (
          <Form.Item name="doctorId" label="Doctor" rules={[{ required: true, message: "Select a doctor" }]}>
            <Select showSearch optionFilterProp="label" placeholder="Select doctor" options={doctorOptions} />
          </Form.Item>
        )}

        <Form.Item name="notes" label="Notes (optional)" rules={[{ max: 500, message: "Use 500 characters or fewer" }]}>
          <Input.TextArea rows={3} showCount maxLength={500} placeholder="Anything the next doctor should know" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
