"use client";

import { useState, useEffect } from "react";
import { banksService } from "@/services/banks";
import type { Bank } from "@/types";

interface BankSelectorProps {
  value: string;
  onChange: (bankCode: string) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function BankSelector({
  value,
  onChange,
  required = false,
  label = "Banco *",
  placeholder = "Seleccione el banco",
  className = "",
}: BankSelectorProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banksList = await banksService.getAllBanks();
        setBanks(banksList);
        setError(null);
      } catch (err) {
        console.error('Error loading banks:', err);
        setError('Error al cargar los bancos');
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, []);

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 animate-pulse">
          Cargando bancos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="w-full px-4 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">{placeholder}</option>
        {banks.map((bank) => (
          <option key={bank.uuid} value={bank.code}>
            {bank.name}
          </option>
        ))}
      </select>
    </div>
  );
}
