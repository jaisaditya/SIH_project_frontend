// src/pages/RecordDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchHealthRecordById } from "../services/api"; // make sure this exists

export default function RecordDetails() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchHealthRecordById(id);
        setRecord(res);
      } catch (err) {
        console.error("❌ Failed to load record", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!record) return <p className="p-6 text-red-500">Record not found</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Record Details</h1>
      <div className="bg-white shadow rounded-lg p-4">
        <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
        <p><strong>Prescription:</strong> {record.prescription}</p>
        <p><strong>Notes:</strong> {record.notes}</p>
        <p className="text-slate-500 text-sm">
          {new Date(record.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
