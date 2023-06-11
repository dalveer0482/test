import { Money, useMoney } from '@shopify/hydrogen';
export function FreeshippingBar({
    title = 'Featured Products',
    amount,
    count = 12,
    ...props
  }) {
const totalamount = amount.amount;
const minimumAmount = 100;
if(totalamount > minimumAmount){

}else{

}
const totalNeed = minimumAmount - totalamount;
const needtotal = totalamount / minimumAmount * 100;

    return (<>
        <div {...props} className="free-shipping bg-[#F5F5F5] px-4 py-[12px] text-center">
            {totalamount < minimumAmount ?(
            <div className="flex font-bold justify-center mb-1.5 success-msg text-[14px]"><Money data={{amount: totalNeed.toString(), currencyCode: amount.currencyCode}} /> 
            FROM FREE SHIPPING!</div>) : (<div className="flex font-bold justify-center mb-1.5 success-msg text-[14px]">YOU HAVE EARNED FREE SHIPPING</div>)}
            <div className="w-full free-shipping-progressbar overflow-hidden bg-[#D9D9D9] h-1.5 rounded-xl">
                <div className="bg-[#C40314] h-full" style={{width: `${needtotal < 100 ? needtotal : 100}%`}}></div>
            </div>
        </div>
    </>);
}
