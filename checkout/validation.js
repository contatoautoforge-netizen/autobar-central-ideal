export const digits = value => String(value || '').replace(/\D/g, '');
export const nationalPhone = value => {
  const phone = digits(value);
  return phone.length === 13 && phone.startsWith('55') ? phone.slice(2) : phone;
};

export function formatCpf(value) {
  const cpf = digits(value).slice(0, 11);
  return cpf.slice(0,3) + (cpf.length > 3 ? '.' + cpf.slice(3,6) : '') +
    (cpf.length > 6 ? '.' + cpf.slice(6,9) : '') +
    (cpf.length > 9 ? '-' + cpf.slice(9) : '');
}

export function formatCnpj(value) {
  const cnpj = digits(value).slice(0, 14);
  return cnpj.slice(0,2) + (cnpj.length > 2 ? '.' + cnpj.slice(2,5) : '') +
    (cnpj.length > 5 ? '.' + cnpj.slice(5,8) : '') +
    (cnpj.length > 8 ? '/' + cnpj.slice(8,12) : '') +
    (cnpj.length > 12 ? '-' + cnpj.slice(12) : '');
}

export function formatPhone(value) {
  const phone = nationalPhone(value).slice(0, 11);
  if (!phone) return '';
  if (phone.length <= 2) return '(' + phone;
  return '(' + phone.slice(0,2) + ') ' + phone.slice(2,7) +
    (phone.length > 7 ? '-' + phone.slice(7) : '');
}

export function validCpf(value) {
  const cpf = digits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  for (let size = 9; size <= 10; size++) {
    const sum = [...cpf.slice(0, size)].reduce((total, digit, index) => total + Number(digit) * (size + 1 - index), 0);
    const check = (sum * 10) % 11 % 10;
    if (check !== Number(cpf[size])) return false;
  }
  return true;
}

export function validCnpj(value) {
  const cnpj = digits(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  for (let size = 12; size <= 13; size++) {
    const weights = size === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
    const sum = weights.reduce((total, weight, index) => total + Number(cnpj[index]) * weight, 0);
    const check = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (check !== Number(cnpj[size])) return false;
  }
  return true;
}

const mobileDdds = new Set('11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' '));
export const validPhone = value => {
  const phone = nationalPhone(value);
  return phone.length === 11 && mobileDdds.has(phone.slice(0,2)) && /^9\d{8}$/.test(phone.slice(2)) &&
    !/^(\d)\1{7}$/.test(phone.slice(3));
};
export const validCep = value => digits(value).length === 8;
export const validName = value => String(value || '').trim().split(/\s+/).filter(Boolean).length >= 2 && String(value).trim().length >= 5;
export const validEmail = value => {
  const email = String(value || '').trim();
  if (email.length > 254) return false;
  const [local,domain,...extra] = email.split('@');
  if (extra.length || !local || local.length > 64 || !domain) return false;
  return /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(local) &&
    /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/.test(domain);
};
