// src/App.tsx
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

function App() {
  const [name, setName] = useState("");
  const [meter, setMeter] = useState("");
  const [kwh, setKwh] = useState<number>(0);
  const [tokens, setTokens] = useState<any[]>([]);

  // Simulasi harga per kWh (misal: Rp 1.500)
  const pricePerKwh = 1500;

  // Generate token code (simulasi)
  const generateToken = () => {
    return Math.floor(Math.random() * 1000000000000)
      .toString()
      .padStart(12, "0");
  };

  // Simpan ke Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokenCode = generateToken();
    const totalPrice = kwh * pricePerKwh;

    const { data, error } = await supabase
      .from("billing_tokens")
      .insert([
        {
          customer_name: name,
          meter_number: meter,
          token_code: tokenCode,
          amount_kwh: kwh,
          price: totalPrice,
        },
      ])
      .select();

    if (error) {
      alert("Error saving token: " + error.message);
      return;
    }

    // Refresh list
    fetchTokens();
    setName("");
    setMeter("");
    setKwh(0);
  };

  // Ambil data dari Supabase
  const fetchTokens = async () => {
    const { data, error } = await supabase
      .from("billing_tokens")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tokens:", error);
      return;
    }

    setTokens(data || []);
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>⚡ Billing Token Listrik</h1>

      {/* Form Input */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Nama Pelanggan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: "8px", margin: "5px" }}
        />
        <input
          type="text"
          placeholder="Nomor Meter"
          value={meter}
          onChange={(e) => setMeter(e.target.value)}
          required
          style={{ padding: "8px", margin: "5px" }}
        />
        <input
          type="number"
          placeholder="Jumlah kWh"
          value={kwh}
          onChange={(e) => setKwh(Number(e.target.value))}
          min="1"
          required
          style={{ padding: "8px", margin: "5px" }}
        />
        <button type="submit" style={{ padding: "8px", margin: "5px" }}>
          Generate Token
        </button>
      </form>

      {/* Daftar Riwayat */}
      <h2>📋 Riwayat Token</h2>
      <table
        border={1}
        cellPadding="8"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Nama</th>
            <th>Nomor Meter</th>
            <th>Token</th>
            <th>KWh</th>
            <th>Harga</th>
            <th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.id}>
              <td>{t.customer_name}</td>
              <td>{t.meter_number}</td>
              <td>
                <strong>{t.token_code}</strong>
              </td>
              <td>{t.amount_kwh} kWh</td>
              <td>Rp {t.price.toLocaleString()}</td>
              <td>{new Date(t.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;