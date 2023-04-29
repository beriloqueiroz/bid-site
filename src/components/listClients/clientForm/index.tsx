/* eslint-disable react/require-default-props */
import { useApply } from '@/lib/redux/hooks';
import { AccountInfo } from '@/lib/types/AccountInfo';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import {
  FormGroup, Input, Label,
} from 'reactstrap';

interface Props {
  action:(info: AccountInfo)=>Promise<Boolean>
  info?: AccountInfo
  buttonText?:string
}

export default function ClientForm({ action, info, buttonText }:Props) {
  const [prefix, setPrefix] = useState(info?.client.prefix || '');
  const [name, setName] = useState(info?.client.prefix || '');
  const [corporateName, setCorporateName] = useState(info?.client.prefix || '');
  const [address, setAddress] = useState(info?.client.prefix || '');
  const [priceCapD, setPriceCapD] = useState(info?.client.prices.capital.d || 15);
  const [priceCapD1, setPriceCapD1] = useState(info?.client.prices.capital.d1 || 17);
  const [priceMetD, setPriceMetD] = useState(info?.client.prices.metropolitana.d || 28);
  const [priceMetD1, setPriceMetD1] = useState(info?.client.prices.metropolitana.d1 || 22);
  const [gain, setGain] = useState(info?.client.prices.gain || 4);

  const apply = useApply();
  function handler() {
    if (
      prefix === '' || name === '' || corporateName === ''
      || address === '' || priceCapD <= 0 || priceCapD1 <= 0
      || priceMetD <= 0 || priceMetD1 <= 0 || gain <= 0
    ) {
      apply('error', { hasError: true, message: 'não deize nenhum campo em branco ou com 0' });
      return;
    }
    action({
      client: {
        address,
        allowInlote: true,
        corporateName,
        name,
        prefix,
        prices: {
          capital: {
            d: priceCapD,
            d1: priceCapD1,
          },
          metropolitana: {
            d: priceMetD,
            d1: priceMetD1,
          },
          gain,
        },
      },
      driver: '',
      key: '',
      model: '',
      rule: '',
      team: '',
    }).then((res) => {
      if (res) {
        setPrefix('');
        setName('');
        setCorporateName('');
        setAddress('');
        setPriceCapD(15);
        setPriceCapD1(17);
        setPriceMetD(28);
        setPriceMetD1(22);
        setGain(4);
      }
    });
  }

  return (
    <div>
      <FormGroup>
        <Label
          for="prefix"
          hidden
        >
          Prefixo
        </Label>
        <Input
          id="prefix"
          name="prefix"
          placeholder="PREFIX"
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label
          for="corporateName"
          hidden
        >
          Razão Social
        </Label>
        <Input
          id="corporateName"
          name="corporateName"
          placeholder="Loja tal"
          type="text"
          value={corporateName}
          onChange={(e) => setCorporateName(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label
          for="address"
          hidden
        >
          Endereço
        </Label>
        <Input
          id="address"
          name="address"
          placeholder="Rua x,123, Montese, fortaleza, box 1 setor 1"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label
          for="name"
          hidden
        >
          Nome Fantasia
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="LojaTudoBom"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </FormGroup>
      <FormGroup>
        <Label
          for="priceCapD"
          hidden
        >
          preço capital expresso
        </Label>
        <Input
          id="priceCapD"
          name="priceCapD"
          placeholder="R$ -"
          type="number"
          value={priceCapD}
          onChange={(e) => setPriceCapD(Number(e.target.value))}
        />
      </FormGroup>
      <FormGroup>
        <Label
          for="priceMetD"
          hidden
        >
          preço metropolitana expresso
        </Label>
        <Input
          id="priceMetD"
          name="priceMetD"
          placeholder="R$ -"
          type="number"
          value={priceMetD}
          onChange={(e) => setPriceMetD(Number(e.target.value))}

        />
      </FormGroup>
      <FormGroup>
        <Label
          for="priceCapD1"
          hidden
        >
          preço capital dia seguinte
        </Label>
        <Input
          id="priceCapD1"
          name="priceCapD1"
          placeholder="R$ -"
          type="number"
          value={priceCapD1}
          onChange={(e) => setPriceCapD1(Number(e.target.value))}
        />
      </FormGroup>
      <FormGroup>
        <Label
          for="priceMetD1"
          hidden
        >
          preço metropolitana dia seguinte
        </Label>
        <Input
          id="priceMetD1"
          name="priceMetD1"
          placeholder="R$ -"
          type="number"
          value={priceMetD1}
          onChange={(e) => setPriceMetD1(Number(e.target.value))}
        />
      </FormGroup>
      <FormGroup>
        <Label
          for="gain"
          hidden
        >
          ganho
        </Label>
        <Input
          id="gain"
          name="gain"
          placeholder="R$ -"
          type="number"
          value={gain}
          onChange={(e) => setGain(Number(e.target.value))}
        />
      </FormGroup>
      <Button onClick={handler}>{buttonText || 'salvar'}</Button>

    </div>
  );
}
