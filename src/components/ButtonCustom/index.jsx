import React from 'react';

const ButtonCustom = ({ type, children, onclick, props }) => {
  return (
    <button type={type} disabled={props.disabled} onClick={onclick} className={`${props?.class ? props.class : ""} py-2.5 px-4 font-semibold AeromaticsRegular rounded-xl shadow-md`}>
      {props?.text || children}
    </button>
  );
};

export default ButtonCustom;