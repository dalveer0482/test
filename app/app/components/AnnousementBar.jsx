import { useState, useEffect } from 'react';
import { Money, useMoney } from '@shopify/hydrogen';
export function AnnousementBar({ data }) {
    let countDownDate = new Date("june 9, 2023 12:57:25").getTime();

    if (data?.annousementTimer?.value) {
        countDownDate = new Date(`${data.annousementTimer.value}`).getTime();
    }


    const [countDown, setCountDown] = useState(
        countDownDate - new Date().getTime()
    );
    // Update the count down every 1 second
    //console.log(data?.annousementTimer.value);
    useEffect(() => {
        const interval = setInterval(() => {
            setCountDown(countDownDate - new Date().getTime());
        }, 1000);
        if (distance > totdd) { return () => clearInterval(interval); } else {
            clearInterval(interval);
        }

    }, [countDownDate]);
    // Get today's date and time
    const now = new Date().getTime();

    // Find the distance between now and the count down date
    const distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const totdd = 0;

    return (<>
        <div className="flex bg-slate-400	">
            <div className="flex-auto w-full text font-size-5 flex justify-center  items-center">
                {data?.annousementText ? (<p className="font-medium py-4 text-base	 whitespace-pre-wrap">{data?.annousementText.value}</p>) : null}
                <div className="text flex-auto w-1/3 flex justify-end absolute right-6 mr-5 pr-5">
                    {distance > totdd ? (<><div className="days flex flex-col px-4">
                        <span className="digits whitespace-pre-wrap  text-base	 font-medium">{days}</span>
                        <span className="label whitespace-pre-wrap  text-xs	 font-normal">DY</span>
                    </div>
                        <div className="hours  flex flex-col px-4">
                            <span className="digits whitespace-pre-wrap  text-base	 font-medium">{hours}</span>
                            <span className="label whitespace-pre-wrap  text-xs	 font-normal">HR</span>
                        </div>
                        <div className="mintue  flex flex-col px-4">
                            <span className="digits whitespace-pre-wrap  text-base	 font-medium">{minutes}</span>
                            <span className="label whitespace-pre-wrap  text-xs	 font-normal">MM</span>
                        </div>
                        <div className="second  flex flex-col px-4">
                            <span className="digits whitespace-pre-wrap  text-base	 font-medium">{seconds}</span>
                            <span className="label whitespace-pre-wrap  text-xs	 font-normal">SS</span>
                        </div></>
                    ) : (<div className="days flex flex-col px-4">
                        <span className="digits whitespace-pre-wrap  text-base	 font-medium">Promotion Expire</span>

                    </div>)}

                </div>
            </div>
        </div>
    </>)
}