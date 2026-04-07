import { useState } from 'react';
import styles from './TimePicker.module.css';

export function TimePicker({ value, onChange, label }) {
  const [h, setH] = useState('12');
  const [m, setM] = useState('00');
  const [period, setPeriod] = useState('PM');

  const update = (newH, newM, newPeriod) => {
    let hour = parseInt(newH);
    if (newPeriod === 'PM' && hour !== 12) hour += 12;
    if (newPeriod === 'AM' && hour === 12) hour = 0;
    const timeStr = `${String(hour).padStart(2, '0')}:${newM}`;
    onChange(timeStr);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const mins = ['00','05','10','15','20','25','30','35','40','45','50','55'];

  return (
    <div className={styles.wrap}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.row}>
        <select className={styles.sel} value={h} onChange={e => { setH(e.target.value); update(e.target.value, m, period); }}>
          {hours.map(hh => <option key={hh}>{hh}</option>)}
        </select>
        <span className={styles.colon}>:</span>
        <select className={styles.sel} value={m} onChange={e => { setM(e.target.value); update(h, e.target.value, period); }}>
          {mins.map(mm => <option key={mm}>{mm}</option>)}
        </select>
        <select className={styles.sel} value={period} onChange={e => { setPeriod(e.target.value); update(h, m, e.target.value); }}>
          <option>AM</option>
          <option>PM</option>
        </select>
      </div>
    </div>
  );
}

export function DatePicker({ value, onChange, label }) {
  const today = new Date();
  const [day, setDay] = useState(String(today.getDate()).padStart(2, '0'));
  const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(today.getFullYear()));

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years = Array.from({ length: 3 }, (_, i) => String(today.getFullYear() + i));
  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  const update = (d, mo, y) => onChange(`${y}-${mo}-${d}`);

  return (
    <div className={styles.wrap}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.row}>
        <select className={styles.sel} value={day} onChange={e => { setDay(e.target.value); update(e.target.value, month, year); }}>
          {days.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className={styles.selWide} value={month} onChange={e => { setMonth(e.target.value); update(day, e.target.value, year); }}>
          {months.map((mo, i) => <option key={mo} value={mo}>{monthNames[i]}</option>)}
        </select>
        <select className={styles.sel} value={year} onChange={e => { setYear(e.target.value); update(day, month, e.target.value); }}>
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}
