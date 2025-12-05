import { useState } from "react";

interface DiscountWheelProps {
    onComplete: (discount: number) => void;
}

export default function DiscountWheel({ onComplete }: DiscountWheelProps) {
    const discountOptions = [0, 5, 10, 15, 20, 25]; // Equal slices
    const discountDisplayOptions = [25, 20, 15, 10, 5, 0];
    const sliceAngle = 360 / discountOptions.length;

    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [hasSpun, setHasSpun] = useState(() => {
        return localStorage.getItem("wheelHasSpun") === "true";
    });

    const spinWheel = () => {
        if (isSpinning || hasSpun) return;
        setIsSpinning(true);

        const randomIndex = Math.floor(Math.random() * discountOptions.length);
        const selectedDiscount = discountOptions[randomIndex];

        // Rotate many times + land on selected slice
        const finalRotation = 360 * 6 + randomIndex * sliceAngle + sliceAngle / 2;
        setRotation(finalRotation);

        setTimeout(() => {
            setIsSpinning(false);
            setHasSpun(true);
            localStorage.setItem("wheelHasSpun", "true");
            onComplete(selectedDiscount);
        }, 4000); // matches CSS transition
    };

    return (
        <div className="wheel-container">
        <div
            className="wheel"
            style={{
                transform: `rotate(${rotation}deg)`,
                transition: "transform 4s cubic-bezier(0.33, 1, 0.68, 1)",
            }}
            >
            {discountDisplayOptions.map((value, index) => {
                const angle = sliceAngle * index + sliceAngle / 2;
                return (
                <div
                    key={index}
                    className="slice"
                    style={{ transform: `rotate(${angle}deg)` }}
                >
                    <span style={{ transform: `translate(-50%, -120px) rotate(${-angle - rotation}deg)` }}>
                    {value}%
                    </span>
                </div>
                );
            })}
        </div>


        <button className="spin-btn" onClick={spinWheel} disabled={isSpinning || hasSpun}>
            {isSpinning ? "Spinning..." :  hasSpun ? "Already spun." : "Spin for Discount"}
        </button>

        <div className="pointer">▼</div>
        </div>
    );
}
