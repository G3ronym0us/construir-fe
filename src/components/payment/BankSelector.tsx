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
        <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
          {label}
        </label>
        <div className="w-full px-4 py-2 border border-sand-300 rounded-lg bg-sand-50 text-sand-600 animate-pulse">
          Cargando bancos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
          {label}
        </label>
        <div className="w-full px-4 py-2 border border-danger-500 rounded-lg bg-danger-50 text-danger-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11.5px] font-bold text-sand-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="min-h-11 w-full rounded-xl border border-sand-300 bg-sand-100 px-3.5 py-3 text-[13.5px] font-medium text-ink placeholder-sand-600 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25"
      >
        <option value="">{placeholder}</option>
        {banks.map((bank) => (
          <option key={bank.code} value={bank.code}>
            {bank.name}
          </option>
        ))}
      </select>
    </div>
  );
}
