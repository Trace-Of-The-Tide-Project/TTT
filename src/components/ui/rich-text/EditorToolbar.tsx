"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCurrentEditor } from "./editor-registry";
import { EDITOR_FONT_FAMILIES } from "./editor-config";
import {
  HeadingIcon,
  QuoteIcon,
  CodeBlockIcon,
  LinkInsertIcon,
  ImageInsertIcon,
  HorizontalRuleIcon,
  FontSizeIcon,
} from "@/components/ui/icons";
import { uploadFileToUrl } from "@/services/uploads.service";
import type { Editor } from "@tiptap/react";

/* ─────────────────────────── icons (Figma `Frame 272`) ─────────────────────────── */

function UndoIcon() {
  return (
    <svg viewBox="18 34 18 20" width="18" height="20" fill="currentColor" aria-hidden>
      <path d="M24 40V42.6122C24 43.1633 23.3572 43.4644 22.9339 43.1116L18.5992 39.4993C18.2874 39.2395 18.2874 38.7605 18.5992 38.5007L22.9339 34.8884C23.3572 34.5356 24 34.8367 24 35.3878V38H28C30.1217 38 32.1566 38.8429 33.6569 40.3431C35.1571 41.8434 36 43.8783 36 46C36 48.1217 35.1571 50.1566 33.6569 51.6569C32.1566 53.1571 30.1217 54 28 54H25C24.4477 54 24 53.5523 24 53C24 52.4477 24.4477 52 25 52H28C29.5913 52 31.1174 51.3679 32.2426 50.2426C33.3679 49.1174 34 47.5913 34 46C34 44.4087 33.3679 42.8826 32.2426 41.7574C31.1174 40.6321 29.5913 40 28 40H24Z" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg viewBox="56 34 18 20" width="18" height="20" fill="currentColor" aria-hidden>
      <path d="M68 40H64C62.4087 40 60.8826 40.6321 59.7574 41.7574C58.6321 42.8826 58 44.4087 58 46C58 47.5913 58.6321 49.1174 59.7574 50.2426C60.8826 51.3679 62.4087 52 64 52H67C67.5523 52 68 52.4477 68 53C68 53.5523 67.5523 54 67 54H64C61.8783 54 59.8434 53.1571 58.3431 51.6569C56.8429 50.1566 56 48.1217 56 46C56 43.8783 56.8429 41.8434 58.3431 40.3431C59.8434 38.8429 61.8783 38 64 38H68V35.3878C68 34.8367 68.6428 34.5356 69.0661 34.8884L73.4008 38.5007C73.7126 38.7605 73.7126 39.2395 73.4008 39.4993L69.0661 43.1116C68.6428 43.4644 68 43.1633 68 42.6122V40Z" />
    </svg>
  );
}

function BoldIcon() {
  return (
    <svg viewBox="189 36 12 16" width="12" height="16" fill="currentColor" aria-hidden>
      <path d="M191 43H195.5C196.163 43 196.799 42.7366 197.268 42.2678C197.737 41.7989 198 41.163 198 40.5C198 39.837 197.737 39.2011 197.268 38.7322C196.799 38.2634 196.163 38 195.5 38H191V43ZM201 47.5C201 48.0909 200.884 48.6761 200.657 49.2221C200.431 49.768 200.1 50.2641 199.682 50.682C199.264 51.0998 198.768 51.4313 198.222 51.6575C197.676 51.8836 197.091 52 196.5 52H189.65C189.291 52 189 51.709 189 51.35V36.65C189 36.291 189.291 36 189.65 36H195.5C196.381 36 197.243 36.2587 197.978 36.7438C198.713 37.2289 199.29 37.9192 199.637 38.7291C199.983 39.5389 200.085 40.4328 199.928 41.2997C199.772 42.1666 199.364 42.9685 198.756 43.606C199.439 44.0013 200.005 44.5692 200.399 45.2526C200.793 45.9361 201 46.7112 201 47.5ZM191 45V50H196.5C197.163 50 197.799 49.7366 198.268 49.2678C198.737 48.7989 199 48.163 199 47.5C199 46.837 198.737 46.2011 198.268 45.7322C197.799 45.2634 197.163 45 196.5 45H191Z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg viewBox="223 36 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M228 37C228 36.4477 228.448 36 229 36H238C238.552 36 239 36.4477 239 37C239 37.5523 238.552 38 238 38H234.235L229.86 50H233C233.552 50 234 50.4477 234 51C234 51.5523 233.552 52 233 52H224C223.448 52 223 51.5523 223 51C223 50.4477 223.448 50 224 50H227.765L232.14 38H229C228.448 38 228 37.5523 228 37Z"
      />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg viewBox="260 35 14 18" width="14" height="18" fill="currentColor" aria-hidden>
      <path d="M263 36C263 35.4477 262.552 35 262 35C261.448 35 261 35.4477 261 36V43C261 46.866 262 50 267 50C272 50 273 46.866 273 43V36C273 35.4477 272.552 35 272 35C271.448 35 271 35.4477 271 36V43C271 45.7614 271 48 267 48C263 48 263 45.7614 263 43V36Z" />
      <path d="M261 51C260.448 51 260 51.4477 260 52C260 52.5523 260.448 53 261 53H273C273.552 53 274 52.5523 274 52C274 51.4477 273.552 51 273 51H261Z" />
    </svg>
  );
}

function StrikethroughIcon() {
  return (
    <svg viewBox="294 35 18 17" width="18" height="17" fill="currentColor" aria-hidden>
      <path d="M308.154 46C308.384 46.516 308.5 47.09 308.5 47.72C308.5 49.062 307.976 50.112 306.929 50.867C305.88 51.622 304.433 52 302.586 52C301.133 52 299.694 51.701 298.267 51.1023C297.927 50.9597 297.716 50.6211 297.716 50.2526C297.716 49.518 298.519 49.0509 299.204 49.3144C300.247 49.7154 301.306 49.916 302.382 49.916C304.933 49.916 306.212 49.184 306.221 47.719C306.226 47.422 306.172 47.1269 306.06 46.8515C305.949 46.5761 305.783 46.3259 305.573 46.116L305.453 45.999H295C294.448 45.999 294 45.5513 294 44.999C294 44.4467 294.448 43.999 295 43.999H311C311.552 43.999 312 44.4467 312 44.999C312 45.5513 311.552 45.999 311 45.999H308.154V46ZM304.019 42.9805C304.03 42.9842 304.028 43 304.016 43H298.633C298.63 43 298.628 42.9991 298.626 42.9974C298.452 42.8384 298.292 42.6646 298.148 42.478C297.716 41.92 297.5 41.246 297.5 40.452C297.5 39.216 297.966 38.165 298.897 37.299C299.83 36.433 301.271 36 303.222 36C304.504 36 305.738 36.2491 306.923 36.7474C307.246 36.8831 307.444 37.206 307.444 37.556C307.444 38.2597 306.672 38.713 306.003 38.4943C305.212 38.2353 304.377 38.106 303.498 38.106C301.018 38.106 299.779 38.888 299.779 40.452C299.779 40.872 299.997 41.238 300.433 41.551C300.869 41.864 302.046 42.301 302.046 42.301L304.019 42.9805Z" />
    </svg>
  );
}

function HighlightSquareIcon({ color }: { color: string }) {
  return (
    <svg viewBox="331 36 40 16" width="40" height="16" fill="none" aria-hidden>
      <path
        d="M334.385 36H343.615C345.485 36 347 37.5155 347 39.3848V48.6152C347 50.4845 345.485 52 343.615 52H334.385C332.515 52 331 50.4845 331 48.6152V39.3848C331 37.5155 332.515 36 334.385 36Z"
        fill={color}
        stroke="#E1E1E2"
        strokeWidth="2"
      />
      <path
        d="M371.41 42C371.935 42 372.197 42.5678 371.826 42.8999L367.417 46.8456C367.187 47.0515 366.813 47.0515 366.583 46.8456L362.174 42.8999C361.803 42.5678 362.065 42 362.59 42L371.41 42Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TextColorIcon() {
  return (
    <svg viewBox="394 35 18 18" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M394 52C394 51.4477 394.448 51 395 51H411C411.552 51 412 51.4477 412 52C412 52.5523 411.552 53 411 53H395C394.448 53 394 52.5523 394 52Z" />
      <path d="M406.496 46H399.504L398.155 49.3714C398.004 49.7511 397.636 50 397.227 50C396.52 50 396.036 49.2855 396.299 48.6287L401.749 35.6286C401.9 35.249 402.268 35 402.677 35H403.323C403.732 35 404.1 35.249 404.251 35.6286L409.701 48.6287C409.964 49.2855 409.48 50 408.773 50C408.364 50 407.996 49.7511 407.845 49.3714L406.496 46ZM405.696 44L403 37.885L400.304 44H405.696Z" />
    </svg>
  );
}

function AlignLeftIcon() {
  return (
    <svg viewBox="506 35.5 18 17" width="18" height="17" fill="currentColor" aria-hidden>
      <path d="M506 36.5C506 35.9477 506.448 35.5 507 35.5H523C523.552 35.5 524 35.9477 524 36.5C524 37.0523 523.552 37.5 523 37.5H507C506.448 37.5 506 37.0523 506 36.5ZM506 51.5C506 50.9477 506.448 50.5 507 50.5H517C517.552 50.5 518 50.9477 518 51.5C518 52.0523 517.552 52.5 517 52.5H507C506.448 52.5 506 52.0523 506 51.5ZM506 46.5C506 45.9477 506.448 45.5 507 45.5H523C523.552 45.5 524 45.9477 524 46.5C524 47.0523 523.552 47.5 523 47.5H507C506.448 47.5 506 47.0523 506 46.5ZM506 41.5C506 40.9477 506.448 40.5 507 40.5H517C517.552 40.5 518 40.9477 518 41.5C518 42.0523 517.552 42.5 517 42.5H507C506.448 42.5 506 42.0523 506 41.5Z" />
    </svg>
  );
}

function AlignCenterIcon() {
  return (
    <svg viewBox="543 35.5 16 17" width="16" height="17" fill="currentColor" aria-hidden>
      <path d="M543 36.5C543 35.9477 543.448 35.5 544 35.5H558C558.552 35.5 559 35.9477 559 36.5C559 37.0523 558.552 37.5 558 37.5H544C543.448 37.5 543 37.0523 543 36.5ZM546 51.5C546 50.9477 546.448 50.5 547 50.5H555C555.552 50.5 556 50.9477 556 51.5C556 52.0523 555.552 52.5 555 52.5H547C546.448 52.5 546 52.0523 546 51.5ZM546 41.5C546 40.9477 546.448 40.5 547 40.5H555C555.552 40.5 556 40.9477 556 41.5C556 42.0523 555.552 42.5 555 42.5H547C546.448 42.5 546 42.0523 546 41.5ZM543 46.5C543 45.9477 543.448 45.5 544 45.5H558C558.552 45.5 559 45.9477 559 46.5C559 47.0523 558.552 47.5 558 47.5H544C543.448 47.5 543 47.0523 543 46.5Z" />
    </svg>
  );
}

function AlignRightIcon() {
  return (
    <svg viewBox="578 35.5 18 17" width="18" height="17" fill="currentColor" aria-hidden>
      <path d="M578 36.5C578 35.9477 578.448 35.5 579 35.5H595C595.552 35.5 596 35.9477 596 36.5C596 37.0523 595.552 37.5 595 37.5H579C578.448 37.5 578 37.0523 578 36.5ZM582 51.5C582 50.9477 582.448 50.5 583 50.5H595C595.552 50.5 596 50.9477 596 51.5C596 52.0523 595.552 52.5 595 52.5H583C582.448 52.5 582 52.0523 582 51.5ZM578 46.5C578 45.9477 578.448 45.5 579 45.5H595C595.552 45.5 596 45.9477 596 46.5C596 47.0523 595.552 47.5 595 47.5H579C578.448 47.5 578 47.0523 578 46.5ZM582 41.5C582 40.9477 582.448 40.5 583 40.5H595C595.552 40.5 596 40.9477 596 41.5C596 42.0523 595.552 42.5 595 42.5H583C582.448 42.5 582 42.0523 582 41.5Z" />
    </svg>
  );
}

function AlignJustifyIcon() {
  return (
    <svg viewBox="614 35.5 18 17" width="18" height="17" fill="currentColor" aria-hidden>
      <path d="M614 36.5C614 35.9477 614.448 35.5 615 35.5H631C631.552 35.5 632 35.9477 632 36.5C632 37.0523 631.552 37.5 631 37.5H615C614.448 37.5 614 37.0523 614 36.5ZM614 51.5C614 50.9477 614.448 50.5 615 50.5H631C631.552 50.5 632 50.9477 632 51.5C632 52.0523 631.552 52.5 631 52.5H615C614.448 52.5 614 52.0523 614 51.5ZM614 46.5C614 45.9477 614.448 45.5 615 45.5H631C631.552 45.5 632 45.9477 632 46.5C632 47.0523 631.552 47.5 631 47.5H615C614.448 47.5 614 47.0523 614 46.5ZM614 41.5C614 40.9477 614.448 40.5 615 40.5H631C631.552 40.5 632 40.9477 632 41.5C632 42.0523 631.552 42.5 631 42.5H615C614.448 42.5 614 42.0523 614 41.5Z" />
    </svg>
  );
}

function LineSpacingIcon() {
  return (
    <svg viewBox="653 35.5 19 17" width="19" height="17" fill="currentColor" aria-hidden>
      <path d="M663.5 36.5C663.5 35.9477 663.948 35.5 664.5 35.5H671.5C672.052 35.5 672.5 35.9477 672.5 36.5C672.5 37.0523 672.052 37.5 671.5 37.5H664.5C663.948 37.5 663.5 37.0523 663.5 36.5Z" />
      <path d="M656.5 50.5C656.5 51.0523 656.948 51.5 657.5 51.5C658.052 51.5 658.5 51.0523 658.5 50.5V38.9142L659.793 40.2071C660.183 40.5976 660.817 40.5976 661.207 40.2071C661.598 39.8166 661.598 39.1834 661.207 38.7929L658.207 35.7929C658.02 35.6054 657.765 35.5 657.5 35.5C657.235 35.5 656.98 35.6054 656.793 35.7929L653.793 38.7929C653.402 39.1834 653.402 39.8166 653.793 40.2071C654.183 40.5976 654.817 40.5976 655.207 40.2071L656.5 38.9142V50.5Z" />
      <path d="M656.5 39.5C656.5 38.9477 656.948 38.5 657.5 38.5C658.052 38.5 658.5 38.9477 658.5 39.5V49.0858L659.793 47.7929C660.183 47.4024 660.817 47.4024 661.207 47.7929C661.598 48.1834 661.598 48.8166 661.207 49.2071L658.207 52.2071C658.02 52.3946 657.765 52.5 657.5 52.5C657.235 52.5 656.98 52.3946 656.793 52.2071L653.793 49.2071C653.402 48.8166 653.402 48.1834 653.793 47.7929C654.183 47.4024 654.817 47.4024 655.207 47.7929L656.5 49.0858V39.5Z" />
      <path d="M663.5 41.5C663.5 40.9477 663.948 40.5 664.5 40.5H671.5C672.052 40.5 672.5 40.9477 672.5 41.5C672.5 42.0523 672.052 42.5 671.5 42.5H664.5C663.948 42.5 663.5 42.0523 663.5 41.5Z" />
      <path d="M663.5 46.5C663.5 45.9477 663.948 45.5 664.5 45.5H671.5C672.052 45.5 672.5 45.9477 672.5 46.5C672.5 47.0523 672.052 47.5 671.5 47.5H664.5C663.948 47.5 663.5 47.0523 663.5 46.5Z" />
      <path d="M663.5 51.5C663.5 50.9477 663.948 50.5 664.5 50.5H671.5C672.052 50.5 672.5 50.9477 672.5 51.5C672.5 52.0523 672.052 52.5 671.5 52.5H664.5C663.948 52.5 663.5 52.0523 663.5 51.5Z" />
    </svg>
  );
}

function IndentDecreaseIcon() {
  return (
    <svg viewBox="690 36 18 17" width="18" height="17" fill="currentColor" aria-hidden>
      <path d="M690 37C690 36.4477 690.448 36 691 36H707C707.552 36 708 36.4477 708 37C708 37.5523 707.552 38 707 38H691C690.448 38 690 37.5523 690 37ZM690 52C690 51.4477 690.448 51 691 51H707C707.552 51 708 51.4477 708 52C708 52.5523 707.552 53 707 53H691C690.448 53 690 52.5523 690 52ZM698 47C698 46.4477 698.448 46 699 46H707C707.552 46 708 46.4477 708 47C708 47.5523 707.552 48 707 48H699C698.448 48 698 47.5523 698 47ZM698 42C698 41.4477 698.448 41 699 41H707C707.552 41 708 41.4477 708 42C708 42.5523 707.552 43 707 43H699C698.448 43 698 42.5523 698 42ZM690.559 44.9892C690.263 44.7302 690.263 44.2698 690.559 44.0108L692.922 41.9433C693.342 41.5755 694 41.874 694 42.4324V46.5676C694 47.126 693.342 47.4245 692.922 47.0567L690.559 44.9892Z" />
    </svg>
  );
}

function IndentIncreaseIcon() {
  return (
    <svg viewBox="726 36 18 17" width="18" height="17" fill="currentColor" aria-hidden>
      <path d="M726 37C726 36.4477 726.448 36 727 36H743C743.552 36 744 36.4477 744 37C744 37.5523 743.552 38 743 38H727C726.448 38 726 37.5523 726 37ZM726 52C726 51.4477 726.448 51 727 51H743C743.552 51 744 51.4477 744 52C744 52.5523 743.552 53 743 53H727C726.448 53 726 52.5523 726 52ZM734 47C734 46.4477 734.448 46 735 46H743C743.552 46 744 46.4477 744 47C744 47.5523 743.552 48 743 48H735C734.448 48 734 47.5523 734 47ZM734 42C734 41.4477 734.448 41 735 41H743C743.552 41 744 41.4477 744 42C744 42.5523 743.552 43 743 43H735C734.448 43 734 42.5523 734 42ZM729.441 44.0108C729.737 44.2698 729.737 44.7302 729.441 44.9892L727.078 47.0567C726.658 47.4245 726 47.126 726 46.5676V42.4324C726 41.874 726.658 41.5755 727.078 41.9433L729.441 44.0108Z" />
    </svg>
  );
}

function FontPickerCaret() {
  return (
    <svg viewBox="142 42 10 5" width="10" height="5" fill="currentColor" aria-hidden>
      <path d="M151.41 42C151.935 42 152.197 42.5678 151.826 42.8999L147.417 46.8456C147.187 47.0515 146.813 47.0515 146.583 46.8456L142.174 42.8999C141.803 42.5678 142.065 42 142.59 42L151.41 42Z" />
    </svg>
  );
}

function ListWithCaretIcon() {
  return (
    <svg viewBox="438 35 42 18" width="42" height="18" fill="currentColor" aria-hidden>
      <path d="M443 37C443 36.4477 443.448 36 444 36H455C455.552 36 456 36.4477 456 37C456 37.5523 455.552 38 455 38H444C443.448 38 443 37.5523 443 37ZM438 37C438 36.1716 438.672 35.5 439.5 35.5C440.328 35.5 441 36.1716 441 37C441 37.8284 440.328 38.5 439.5 38.5C438.672 38.5 438 37.8284 438 37ZM438 44C438 43.1716 438.672 42.5 439.5 42.5C440.328 42.5 441 43.1716 441 44C441 44.8284 440.328 45.5 439.5 45.5C438.672 45.5 438 44.8284 438 44ZM438 51C438 50.1716 438.672 49.5 439.5 49.5C440.328 49.5 441 50.1716 441 51C441 51.8284 440.328 52.5 439.5 52.5C438.672 52.5 438 51.8284 438 51ZM443 44C443 43.4477 443.448 43 444 43H455C455.552 43 456 43.4477 456 44C456 44.5523 455.552 45 455 45H444C443.448 45 443 44.5523 443 44ZM443 51C443 50.4477 443.448 50 444 50H455C455.552 50 456 50.4477 456 51C456 51.5523 455.552 52 455 52H444C443.448 52 443 51.5523 443 51Z" />
      <path d="M479.41 42C479.935 42 480.197 42.5678 479.826 42.8999L475.417 46.8456C475.187 47.0515 474.813 47.0515 474.583 46.8456L470.174 42.8999C469.803 42.5678 470.065 42 470.59 42L479.41 42Z" />
    </svg>
  );
}

function ClearFormatIcon() {
  return (
    <svg viewBox="762 35.5 18 17.5" width="18" height="17.5" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M767.5 37C767.5 36.4477 767.948 36 768.5 36H778.5C779.052 36 779.5 36.4477 779.5 37V39C779.5 39.5523 779.052 40 778.5 40C777.948 40 777.5 39.5523 777.5 39V38H772.383L772.117 40.124C772.049 40.6721 771.549 41.0608 771.001 40.9923C770.453 40.9238 770.064 40.424 770.133 39.876L770.367 38H768.5C767.948 38 767.5 37.5523 767.5 37ZM762.757 36.831C763.126 36.4205 763.758 36.3872 764.169 36.7567L779.169 50.2567C779.579 50.6262 779.613 51.2585 779.243 51.669C778.874 52.0795 778.242 52.1128 777.831 51.7433L771.277 45.8448L770.492 52.124C770.424 52.6721 769.924 53.0608 769.376 52.9923C768.828 52.9238 768.439 52.424 768.508 51.876L769.465 44.2143L762.831 38.2433C762.421 37.8738 762.387 37.2415 762.757 36.831Z"
      />
    </svg>
  );
}

/* ─────────────────────────── popover (close-on-outside) ─────────────────────────── */

function Popover({
  trigger,
  children,
}: {
  trigger: (open: boolean, toggle: () => void) => ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative shrink-0">
      {trigger(open, () => setOpen((o) => !o))}
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-[320px] min-w-[160px] overflow-y-auto rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-2)] py-1 shadow-lg">
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

function PopoverItem({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-[var(--tott-dash-ghost-hover)] ${
        active ? "text-foreground" : "text-[var(--tott-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── shared button ─────────────────────────── */

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors disabled:opacity-40 disabled:hover:bg-transparent ${
        active
          ? "bg-white/10 text-foreground"
          : "text-[var(--tott-muted)] hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/** Arabic-aware font menu shared with the editor config. The visual font preview
 *  in the popover requires the font to be loaded; the font-family CSS is still
 *  applied to the saved HTML regardless of which faces are loaded locally. */
const FONT_FAMILIES = EDITOR_FONT_FAMILIES;

/* ─────────────────────────── toolbar ─────────────────────────── */

export function EditorToolbar() {
  const editor = useCurrentEditor();
  const disabled = !editor;

  const run = (fn: (e: Editor) => void) => () => {
    if (!editor) return;
    fn(editor);
  };

  const currentFont =
    (editor?.getAttributes("textStyle").fontFamily as string | undefined) ?? "Arial";
  const currentHighlight =
    (editor?.getAttributes("highlight").color as string | undefined) ?? "#2463EB";

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex w-full flex-wrap items-center justify-between gap-y-2 rounded-md bg-[var(--tott-dash-control-bg)] px-3 py-3"
    >
      <ToolbarButton
        label="Undo"
        disabled={disabled || !editor?.can().undo()}
        onClick={run((e) => e.chain().focus().undo().run())}
      >
        <UndoIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={disabled || !editor?.can().redo()}
        onClick={run((e) => e.chain().focus().redo().run())}
      >
        <RedoIcon />
      </ToolbarButton>

      <Popover
        trigger={(open, toggle) => (
          <button
            type="button"
            disabled={disabled}
            aria-label="Text style"
            aria-expanded={open}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggle}
            className="flex h-6 shrink-0 items-center gap-2 rounded bg-[var(--tott-dash-input-bg)] px-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <HeadingIcon />
            <span>
              {editor?.isActive("heading", { level: 1 })
                ? "Heading 1"
                : editor?.isActive("heading", { level: 2 })
                  ? "Heading 2"
                  : editor?.isActive("heading", { level: 3 })
                    ? "Heading 3"
                    : "Paragraph"}
            </span>
          </button>
        )}
      >
        {(close) => (
          <>
            <PopoverItem
              active={editor?.isActive("paragraph")}
              onClick={() => {
                editor?.chain().focus().setParagraph().run();
                close();
              }}
            >
              Paragraph
            </PopoverItem>
            {([1, 2, 3] as const).map((level) => (
              <PopoverItem
                key={level}
                active={editor?.isActive("heading", { level })}
                onClick={() => {
                  editor?.chain().focus().toggleHeading({ level }).run();
                  close();
                }}
              >
                {`Heading ${level}`}
              </PopoverItem>
            ))}
          </>
        )}
      </Popover>

      <Popover
        trigger={(open, toggle) => (
          <button
            type="button"
            disabled={disabled}
            aria-label="Font family"
            aria-expanded={open}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggle}
            className="flex h-6 shrink-0 items-center gap-2 rounded bg-[var(--tott-dash-input-bg)] px-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <span>{currentFont}</span>
            <FontPickerCaret />
          </button>
        )}
      >
        {(close) =>
          FONT_FAMILIES.map((f) => (
            <PopoverItem
              key={f}
              active={currentFont === f}
              onClick={() => {
                editor?.chain().focus().setFontFamily(f).run();
                close();
              }}
            >
              <span style={{ fontFamily: f }}>{f}</span>
            </PopoverItem>
          ))
        }
      </Popover>

      <Popover
        trigger={(open, toggle) => (
          <button
            type="button"
            disabled={disabled}
            aria-label="Font size"
            aria-expanded={open}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggle}
            className="flex h-6 shrink-0 items-center gap-1 rounded bg-[var(--tott-dash-input-bg)] px-2 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <FontSizeIcon />
            <span>
              {(editor?.getAttributes("textStyle").fontSize as string | undefined) ?? "16px"}
            </span>
          </button>
        )}
      >
        {(close) =>
          ["12px", "14px", "16px", "18px", "20px", "24px", "30px", "36px"].map((size) => (
            <PopoverItem
              key={size}
              active={(editor?.getAttributes("textStyle").fontSize as string | undefined) === size}
              onClick={() => {
                editor?.chain().focus().setFontSize(size).run();
                close();
              }}
            >
              {size}
            </PopoverItem>
          ))
        }
      </Popover>

      <ToolbarButton
        label="Bold"
        disabled={disabled}
        active={editor?.isActive("bold")}
        onClick={run((e) => e.chain().focus().toggleBold().run())}
      >
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        disabled={disabled}
        active={editor?.isActive("italic")}
        onClick={run((e) => e.chain().focus().toggleItalic().run())}
      >
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        disabled={disabled}
        active={editor?.isActive("underline")}
        onClick={run((e) => e.chain().focus().toggleUnderline().run())}
      >
        <UnderlineIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        disabled={disabled}
        active={editor?.isActive("strike")}
        onClick={run((e) => e.chain().focus().toggleStrike().run())}
      >
        <StrikethroughIcon />
      </ToolbarButton>

      <label className="relative shrink-0 cursor-pointer" aria-label="Highlight color">
        <HighlightSquareIcon color={currentHighlight} />
        <input
          type="color"
          disabled={disabled}
          value={currentHighlight}
          onChange={(e) => {
            if (!editor) return;
            editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
          }}
          className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </label>

      <label className="relative shrink-0 cursor-pointer" aria-label="Text color">
        <span className="flex h-8 w-8 items-center justify-center text-[var(--tott-muted)] transition-colors hover:text-foreground">
          <TextColorIcon />
        </span>
        <input
          type="color"
          disabled={disabled}
          defaultValue="#F5F5F5"
          onChange={(e) => {
            if (!editor) return;
            editor.chain().focus().setColor(e.target.value).run();
          }}
          className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </label>

      <Popover
        trigger={(open, toggle) => (
          <button
            type="button"
            disabled={disabled}
            aria-label="List style"
            aria-expanded={open}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggle}
            className="flex h-8 items-center justify-center rounded px-1 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground disabled:opacity-40"
          >
            <ListWithCaretIcon />
          </button>
        )}
      >
        {(close) => {
          const inBullet = editor?.isActive("bulletList") ?? false;
          const inOrdered = editor?.isActive("orderedList") ?? false;
          const currentStyle = (editor?.getAttributes(inBullet ? "bulletList" : "orderedList")
            .listStyleType ?? null) as string | null;

          /** Switch to a bullet list with the given style-type, then close. */
          const pickBullet = (style: string) => () => {
            if (!editor) return;
            const c = editor.chain().focus();
            if (!inBullet) c.toggleBulletList().run();
            editor.chain().focus().updateAttributes("bulletList", { listStyleType: style }).run();
            close();
          };
          const pickOrdered = (style: string) => () => {
            if (!editor) return;
            const c = editor.chain().focus();
            if (!inOrdered) c.toggleOrderedList().run();
            editor.chain().focus().updateAttributes("orderedList", { listStyleType: style }).run();
            close();
          };

          return (
            <>
              <div className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Bulleted
              </div>
              <PopoverItem
                active={inBullet && currentStyle === "disc"}
                onClick={pickBullet("disc")}
              >
                ● Disc
              </PopoverItem>
              <PopoverItem
                active={inBullet && currentStyle === "circle"}
                onClick={pickBullet("circle")}
              >
                ○ Circle
              </PopoverItem>
              <PopoverItem
                active={inBullet && currentStyle === "square"}
                onClick={pickBullet("square")}
              >
                ■ Square
              </PopoverItem>

              <div className="mt-1 px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Numbered
              </div>
              <PopoverItem
                active={inOrdered && (currentStyle === null || currentStyle === "decimal")}
                onClick={pickOrdered("decimal")}
              >
                1. Decimal
              </PopoverItem>
              <PopoverItem
                active={inOrdered && currentStyle === "lower-alpha"}
                onClick={pickOrdered("lower-alpha")}
              >
                a. Lower alpha
              </PopoverItem>
              <PopoverItem
                active={inOrdered && currentStyle === "upper-alpha"}
                onClick={pickOrdered("upper-alpha")}
              >
                A. Upper alpha
              </PopoverItem>
              <PopoverItem
                active={inOrdered && currentStyle === "lower-roman"}
                onClick={pickOrdered("lower-roman")}
              >
                i. Lower roman
              </PopoverItem>
              <PopoverItem
                active={inOrdered && currentStyle === "upper-roman"}
                onClick={pickOrdered("upper-roman")}
              >
                I. Upper roman
              </PopoverItem>

              <div className="mt-1 px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                Checklist
              </div>
              <PopoverItem
                active={editor?.isActive("taskList")}
                onClick={() => {
                  editor?.chain().focus().toggleTaskList().run();
                  close();
                }}
              >
                ☐ Task list
              </PopoverItem>
            </>
          );
        }}
      </Popover>

      <ToolbarButton
        label="Align left"
        disabled={disabled}
        active={editor?.isActive({ textAlign: "left" })}
        onClick={run((e) => e.chain().focus().setTextAlign("left").run())}
      >
        <AlignLeftIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Align center"
        disabled={disabled}
        active={editor?.isActive({ textAlign: "center" })}
        onClick={run((e) => e.chain().focus().setTextAlign("center").run())}
      >
        <AlignCenterIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Align right"
        disabled={disabled}
        active={editor?.isActive({ textAlign: "right" })}
        onClick={run((e) => e.chain().focus().setTextAlign("right").run())}
      >
        <AlignRightIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Justify"
        disabled={disabled}
        active={editor?.isActive({ textAlign: "justify" })}
        onClick={run((e) => e.chain().focus().setTextAlign("justify").run())}
      >
        <AlignJustifyIcon />
      </ToolbarButton>

      <ToolbarButton
        label="Line spacing"
        disabled={disabled}
        onClick={run((e) => {
          const cycle = ["1", "1.15", "1.5", "2"] as const;
          const current = e.getAttributes("paragraph").lineHeight as string | null | undefined;
          const idx = current ? cycle.indexOf(current as (typeof cycle)[number]) : -1;
          const next = cycle[(idx + 1) % cycle.length]!;
          e.chain().focus().setLineHeight(next).run();
        })}
      >
        <LineSpacingIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Decrease indent"
        disabled={disabled}
        onClick={run((e) => e.chain().focus().outdent().run())}
      >
        <IndentDecreaseIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Increase indent"
        disabled={disabled}
        onClick={run((e) => e.chain().focus().indent().run())}
      >
        <IndentIncreaseIcon />
      </ToolbarButton>

      <ToolbarButton
        label="Blockquote"
        disabled={disabled}
        active={editor?.isActive("blockquote")}
        onClick={run((e) => e.chain().focus().toggleBlockquote().run())}
      >
        <QuoteIcon />
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        disabled={disabled}
        active={editor?.isActive("codeBlock")}
        onClick={run((e) => e.chain().focus().toggleCodeBlock().run())}
      >
        <CodeBlockIcon />
      </ToolbarButton>

      <Popover
        trigger={(open, toggle) => (
          <button
            type="button"
            disabled={disabled}
            aria-label="Link"
            aria-expanded={open}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggle}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors disabled:opacity-40 ${
              editor?.isActive("link")
                ? "bg-white/10 text-foreground"
                : "text-[var(--tott-muted)] hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
            }`}
          >
            <LinkInsertIcon />
          </button>
        )}
      >
        {(close) => (
          <div className="w-60 p-2">
            <input
              type="url"
              defaultValue={(editor?.getAttributes("link").href as string | undefined) ?? ""}
              placeholder="https://example.com"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const url = (e.target as HTMLInputElement).value.trim();
                  if (url) {
                    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                  } else {
                    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                  }
                  close();
                }
              }}
              className="w-full rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-2 py-1.5 text-xs text-foreground outline-none focus:border-[#C9A96E]/60"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                close();
              }}
              className="mt-2 w-full rounded-md px-2 py-1 text-xs text-[var(--tott-muted)] hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
            >
              Remove link
            </button>
          </div>
        )}
      </Popover>

      <Popover
        trigger={(open, toggle) => (
          <button
            type="button"
            disabled={disabled}
            aria-label="Image"
            aria-expanded={open}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggle}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground disabled:opacity-40"
          >
            <ImageInsertIcon />
          </button>
        )}
      >
        {(close) => (
          <div className="w-64 p-2">
            <label className="block cursor-pointer rounded-md border border-dashed border-[var(--tott-card-border)] px-2 py-3 text-center text-xs text-[var(--tott-muted)] hover:text-foreground">
              Upload image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !editor) return;
                  try {
                    const url = await uploadFileToUrl(file);
                    editor.chain().focus().setImage({ src: url, alt: file.name }).run();
                  } catch {
                    // upload errors are surfaced by the app's global toast layer
                  }
                  close();
                }}
              />
            </label>
            <input
              type="url"
              placeholder="…or paste an image URL"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const url = (e.target as HTMLInputElement).value.trim();
                  if (url) editor?.chain().focus().setImage({ src: url }).run();
                  close();
                }
              }}
              className="mt-2 w-full rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-2 py-1.5 text-xs text-foreground outline-none focus:border-[#C9A96E]/60"
            />
          </div>
        )}
      </Popover>

      <ToolbarButton
        label="Horizontal rule"
        disabled={disabled}
        onClick={run((e) => e.chain().focus().setHorizontalRule().run())}
      >
        <HorizontalRuleIcon />
      </ToolbarButton>

      <ToolbarButton
        label="Clear formatting"
        disabled={disabled}
        onClick={run((e) => e.chain().focus().clearNodes().unsetAllMarks().run())}
      >
        <ClearFormatIcon />
      </ToolbarButton>
    </div>
  );
}
