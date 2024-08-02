/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ReactNode, createContext } from "react";
import { CookieConsent, DeploymentConfigFactory } from "..";
import { NullLogging } from "./logging";
import theme from "./theme";

const stubConsentValue: CookieConsent = {
  analytics: false,
  functional: true,
};
const stubConsentContext = createContext<CookieConsent | undefined>(
  stubConsentValue
);

const defaultDeploymentFactory: DeploymentConfigFactory = () => ({
  chakraTheme: theme,
  // This isn't ideal as it's the branded version. You can just remove the field to remove the welcome dialog.
  welcomeVideoYouTubeId: "mREwMW69qKc",
  squareLogo: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 227 227" fill="none">
  <ellipse cx="75.575" cy="190.137" rx="36.4519" ry="36.4516" fill="white"/>
  <path fillRule="evenodd" clipRule="evenodd" d="M79.2228 149.86C78.023 149.979 76.8061 150.04 75.575 150.04C55.4431 150.04 39.123 133.72 39.123 113.589C39.123 93.4569 55.4431 77.1369 75.575 77.1369C76.8061 77.1369 78.023 77.198 79.2228 77.3172V77.137H152.127C152.127 77.137 152.128 77.137 152.129 77.137C172.26 77.137 188.581 93.4569 188.581 113.589C188.581 133.72 172.26 150.04 152.129 150.04C152.128 150.04 152.127 150.04 152.127 150.04H79.2228V149.86Z" fill="white"/>
  <path fillRule="evenodd" clipRule="evenodd" d="M188.453 171.673C188.453 161.607 180.293 153.447 170.227 153.447V153.447C160.161 153.447 152.001 161.607 152.001 171.673V171.673C152.001 181.739 143.841 189.899 133.775 189.899V189.899C123.709 189.899 115.549 198.059 115.549 208.124V208.124C115.549 218.19 123.709 226.35 133.775 226.35H152.001C172.133 226.35 188.453 210.03 188.453 189.899V171.673Z" fill="white"/>
  <path fillRule="evenodd" clipRule="evenodd" d="M75.575 73.4918C95.7068 73.4918 112.027 57.1719 112.027 37.0402C112.027 16.9085 95.7068 0.588562 75.575 0.588562C55.4431 0.588562 39.123 16.9085 39.123 37.0402C39.123 57.1719 55.4431 73.4918 75.575 73.4918ZM75.5793 50.1038C82.7941 50.1038 88.6429 44.2551 88.6429 37.0403C88.6429 29.8255 82.7941 23.9768 75.5793 23.9768C68.3644 23.9768 62.5156 29.8255 62.5156 37.0403C62.5156 44.2551 68.3644 50.1038 75.5793 50.1038Z" fill="white"/>
  <path fillRule="evenodd" clipRule="evenodd" d="M152.001 73.4918C172.133 73.4918 188.453 57.1719 188.453 37.0402C188.453 16.9085 172.133 0.588577 152.001 0.588577C131.869 0.588577 115.549 16.9085 115.549 37.0402C115.549 57.1719 131.869 73.4918 152.001 73.4918ZM152.005 50.1038C159.22 50.1038 165.069 44.2551 165.069 37.0403C165.069 29.8255 159.22 23.9768 152.005 23.9768C144.79 23.9768 138.941 29.8255 138.941 37.0403C138.941 44.2551 144.79 50.1038 152.005 50.1038Z" fill="white"/>
  </svg>
  ,
  horizontalLogo: <svg viewBox="0 0 422 114" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M47.4115 57.4653C48.1868 57.4653 48.7831 57.853 49.2006 58.6283C49.6181 59.4036 49.8268 60.3876 49.8268 61.5804C49.8268 63.0714 49.6181 64.2343 49.2006 65.0692C48.7831 65.8445 48.1271 66.3813 47.2325 66.6795C43.6542 67.9319 39.7181 68.6475 35.4242 68.8264C34.2314 73.7764 31.9651 77.7722 28.6254 80.8137C25.3453 83.8553 21.7073 85.3761 17.7116 85.3761C11.6881 85.3761 7.30469 83.08 4.56133 78.4878C1.81797 73.8957 0.446289 67.246 0.446289 58.5388C0.446289 50.8455 1.4005 42.4961 3.30893 33.4907C5.21735 24.4257 7.99053 16.7324 11.6285 10.4107C15.326 4.02942 19.7095 0.838776 24.7787 0.838776C27.5221 0.838776 29.7287 2.03154 31.3986 4.41708C33.0684 6.74297 33.9034 9.78452 33.9034 13.5417C33.9034 18.4321 32.979 23.2926 31.1302 28.1233C29.2814 32.954 26.21 38.0233 21.9161 43.3311C25.9118 43.6293 29.1621 45.2991 31.6669 48.3407C34.1717 51.3226 35.6627 55.0202 36.1398 59.4334C38.9428 59.2545 42.2826 58.6581 46.159 57.6443C46.5169 57.525 46.9343 57.4653 47.4115 57.4653ZM22.7212 9.69507C21.5284 9.69507 20.2164 11.4842 18.7851 15.0625C17.4134 18.5812 16.1312 23.3821 14.9384 29.4652C13.7456 35.5483 12.8511 42.1979 12.2547 49.4142C16.1908 42.1979 19.3218 35.8465 21.6477 30.3597C24.0332 24.8134 25.226 19.8932 25.226 15.5993C25.226 13.6908 24.9874 12.2297 24.5103 11.2158C24.0929 10.202 23.4965 9.69507 22.7212 9.69507ZM18.0694 75.8936C19.9182 75.8936 21.5582 75.1183 22.9896 73.5677C24.4209 72.0171 25.3751 69.7807 25.8522 66.8584C24.0034 65.606 22.5721 63.9659 21.5582 61.9382C20.604 59.9105 20.1269 57.7635 20.1269 55.4973C20.1269 54.6623 20.2462 53.5292 20.4848 52.0979H20.2164C17.7712 52.0979 15.7137 53.3205 14.0438 55.7657C12.4336 58.1512 11.6285 61.3717 11.6285 65.4271C11.6285 68.8264 12.2547 71.4207 13.5071 73.2099C14.8191 74.999 16.3399 75.8936 18.0694 75.8936Z" fill="white" />
    <path d="M53.8216 37.3374C51.3168 37.3374 49.4382 36.7709 48.1858 35.6377C46.9334 34.445 46.3072 32.8049 46.3072 30.7176C46.3072 28.6302 47.1123 26.9007 48.7226 25.529C50.3924 24.0977 52.45 23.3821 54.8951 23.3821C57.1017 23.3821 58.8909 23.9188 60.2626 24.9923C61.6343 26.0658 62.3201 27.5866 62.3201 29.5546C62.3201 31.9402 61.5448 33.8486 59.9942 35.2799C58.4436 36.6516 56.3861 37.3374 53.8216 37.3374ZM53.106 85.3761C49.2295 85.3761 46.3967 84.0044 44.6075 81.261C42.878 78.5177 42.0133 74.8797 42.0133 70.3472C42.0133 67.6635 42.3413 64.2343 42.9973 60.0596C43.7129 55.8253 44.6075 51.8892 45.681 48.2512C46.2178 46.3428 46.9334 45.0308 47.828 44.3151C48.7226 43.5994 50.1539 43.2416 52.1219 43.2416C55.1635 43.2416 56.6843 44.2555 56.6843 46.2832C56.6843 47.7741 56.1177 51.2331 54.9846 56.6602C53.5533 63.2204 52.8376 67.6635 52.8376 69.9894C52.8376 71.7785 53.0762 73.1502 53.5533 74.1044C54.0304 75.0586 54.8355 75.5358 55.9686 75.5358C57.0421 75.5358 58.384 74.7903 59.9942 73.2993C61.6044 71.8084 63.7514 69.4526 66.4351 66.2322C67.1508 65.3972 67.9559 64.9798 68.8505 64.9798C69.6258 64.9798 70.2222 65.3376 70.6396 66.0533C71.1167 66.7689 71.3553 67.753 71.3553 69.0054C71.3553 71.3909 70.7887 73.2397 69.6556 74.5517C63.7514 81.768 58.2349 85.3761 53.106 85.3761Z" fill="white" />
    <path d="M104.016 64.9798C104.791 64.9798 105.387 65.3376 105.805 66.0533C106.282 66.7689 106.52 67.753 106.52 69.0054C106.52 71.3909 105.954 73.2397 104.821 74.5517C102.256 77.7126 99.4533 80.3068 96.4118 82.3345C93.3702 84.3622 89.8814 85.3761 85.9452 85.3761C73.779 85.3761 67.6959 76.818 67.6959 59.7018C67.6959 57.0777 67.7854 54.4238 67.9643 51.7401H64.4755C62.6863 51.7401 61.4637 51.4121 60.8077 50.756C60.2113 50.1 59.9131 49.0564 59.9131 47.625C59.9131 44.2853 61.255 42.6154 63.9387 42.6154H69.0378C70.0516 36.0552 71.6022 30.0615 73.6896 24.6345C75.7769 19.2074 78.2817 14.8836 81.204 11.6631C84.1859 8.44266 87.3766 6.83243 90.7759 6.83243C93.2808 6.83243 95.2488 7.93574 96.6801 10.1424C98.1115 12.349 98.8271 15.1222 98.8271 18.4619C98.8271 27.7058 94.9506 35.757 87.1976 42.6154H97.2169C98.1711 42.6154 98.8569 42.8241 99.2744 43.2416C99.6919 43.6591 99.9006 44.4344 99.9006 45.5675C99.9006 49.6826 96.531 51.7401 89.7919 51.7401H78.8781C78.7588 54.722 78.6992 57.0479 78.6992 58.7178C78.6992 64.9201 79.4148 69.2737 80.8462 71.7785C82.3371 74.2834 84.663 75.5358 87.8238 75.5358C90.3883 75.5358 92.6545 74.7605 94.6226 73.2099C96.5907 71.6593 98.9166 69.3334 101.6 66.2322C102.316 65.3972 103.121 64.9798 104.016 64.9798ZM88.3606 15.4203C87.466 15.4203 86.4522 16.5535 85.319 18.8197C84.2456 21.0263 83.2019 24.1275 82.188 28.1233C81.2338 32.0594 80.4287 36.4428 79.7727 41.2735C83.2913 38.232 85.9154 34.8326 87.6449 31.0754C89.4341 27.2585 90.3287 23.7995 90.3287 20.6983C90.3287 17.1797 89.6726 15.4203 88.3606 15.4203Z" fill="white" />
    <path d="M115.876 87.3441C112.775 87.3441 110.389 86.6285 108.719 85.1972C107.109 83.7658 106.304 82.1556 106.304 80.3665C106.304 78.8159 106.87 77.474 108.003 76.3409C109.137 75.2077 110.806 74.6412 113.013 74.6412C113.788 74.6412 114.683 74.7306 115.697 74.9096C116.77 75.0288 117.575 75.1183 118.112 75.1779C118.053 73.6273 117.695 72.1662 117.039 70.7945C116.442 69.4228 115.667 68.1108 114.713 66.8584C113.759 65.5463 112.864 64.4132 112.029 63.459C110.18 66.9777 108.331 69.8999 106.483 72.2258C104.694 74.5517 102.726 76.7583 100.579 78.8457C99.505 79.9192 98.3719 80.4559 97.1791 80.4559C96.2249 80.4559 95.4496 80.1279 94.8532 79.4719C94.2569 78.7562 93.9587 77.8915 93.9587 76.8776C93.9587 75.6849 94.3761 74.5815 95.2111 73.5677L96.374 72.1364C99.6541 68.081 102.129 64.7412 103.799 62.1171C104.813 60.3876 106.006 58.0915 107.377 55.2289C108.749 52.3066 110.091 49.2949 111.403 46.1937C112.536 43.5696 114.892 42.2576 118.47 42.2576C120.14 42.2576 121.303 42.4067 121.959 42.7049C122.615 43.0031 122.943 43.4802 122.943 44.1362C122.943 44.494 122.824 45.0606 122.585 45.8359C122.347 46.6112 122.018 47.3865 121.601 48.1618C120.528 50.3088 119.991 52.1277 119.991 53.6187C119.991 54.5133 120.289 55.4973 120.885 56.5708C121.541 57.6443 122.525 58.9861 123.837 60.5964C125.746 63.1012 127.177 65.2481 128.131 67.0373C129.145 68.7668 129.652 70.6752 129.652 72.7626C129.652 73.359 129.593 74.1939 129.473 75.2674C132.396 74.1343 135.825 71.1225 139.761 66.2322C140.477 65.3972 141.282 64.9798 142.176 64.9798C142.952 64.9798 143.548 65.3376 143.965 66.0533C144.442 66.7689 144.681 67.753 144.681 69.0054C144.681 71.2716 144.114 73.1204 142.981 74.5517C139.999 78.2493 137.137 80.7839 134.393 82.1556C131.71 83.4676 128.37 84.1833 124.374 84.3026C121.989 86.3303 119.156 87.3441 115.876 87.3441Z" fill="white" />
    <path d="M202.828 64.9798C203.603 64.9798 204.199 65.3376 204.617 66.0533C205.094 66.7689 205.333 67.753 205.333 69.0054C205.333 71.3909 204.766 73.2397 203.633 74.5517C201.068 77.7126 198.265 80.3068 195.224 82.3345C192.242 84.3622 188.843 85.3761 185.026 85.3761C180.97 85.3761 177.72 83.9149 175.275 80.9927C172.83 78.0107 171.16 73.9852 170.265 68.9159C168.237 69.4527 166.09 69.721 163.824 69.721C161.856 69.721 159.679 69.5719 157.294 69.2737C158.129 73.0309 158.815 77.2354 159.351 81.8872C159.888 86.539 160.156 90.3559 160.156 93.3378C160.156 99.7787 159.113 104.699 157.025 108.098C154.938 111.498 152.195 113.197 148.795 113.197C144.501 113.197 141.43 110.156 139.581 104.073C137.792 97.9896 136.898 88.8053 136.898 76.5198C136.898 65.0692 138.12 53.4696 140.565 41.7208C143.07 29.9125 146.469 20.1616 150.763 12.4682C155.117 4.71527 159.888 0.838776 165.077 0.838776C167.88 0.838776 170.056 2.09118 171.607 4.59599C173.217 7.1008 174.022 10.4704 174.022 14.7047C174.022 28.7197 165.643 43.9871 148.885 60.5069C148.288 66.3515 147.99 71.4803 147.99 75.8936C147.99 82.0363 148.199 88.3282 148.616 94.7691C149.034 101.27 149.72 104.52 150.674 104.52C152.463 104.52 153.358 101.419 153.358 95.2164C153.358 90.5646 153.03 86.0619 152.374 81.7083C151.777 77.3547 150.942 72.7626 149.869 67.9319C149.809 67.1566 150.048 66.1725 150.585 64.9798C151.181 63.787 151.897 62.7433 152.732 61.8488C153.566 60.9542 154.312 60.5069 154.968 60.5069C155.743 60.5069 156.966 60.5665 158.636 60.6858C160.544 60.8051 161.975 60.8647 162.93 60.8647C165.077 60.8647 167.283 60.5665 169.55 59.9702V59.7018C169.55 52.4259 170.474 44.1362 172.323 34.8326C174.231 25.529 177.004 17.5375 180.642 10.858C184.34 4.17852 188.723 0.838776 193.792 0.838776C196.655 0.838776 198.892 2.18064 200.502 4.86436C202.172 7.48845 203.007 11.2755 203.007 16.2255C203.007 21.0562 202.112 26.5429 200.323 32.6856C198.534 38.8284 195.939 44.7326 192.54 50.3982C189.141 56.0042 185.145 60.5069 180.553 63.9063C180.791 68.1406 181.418 71.1523 182.431 72.9415C183.445 74.671 184.936 75.5358 186.904 75.5358C189.349 75.5358 191.496 74.8499 193.345 73.4782C195.194 72.0469 197.55 69.6316 200.412 66.2322C201.128 65.3972 201.933 64.9798 202.828 64.9798ZM163.198 9.69507C162.125 9.69507 160.783 11.514 159.172 15.152C157.622 18.7899 156.071 23.6206 154.521 29.6441C152.97 35.6079 151.628 41.9296 150.495 48.6091C155.266 43.182 158.934 37.5462 161.498 31.7016C164.063 25.7974 165.375 20.2809 165.434 15.152C165.434 11.514 164.689 9.69507 163.198 9.69507ZM191.824 9.69507C190.572 9.69507 189.111 11.9315 187.441 16.4044C185.831 20.8176 184.37 26.4236 183.058 33.2224C181.746 40.0211 180.94 46.6708 180.642 53.1714C183.624 50.1298 186.159 46.4323 188.246 42.0787C190.333 37.6654 191.854 33.2224 192.808 28.7495C193.822 24.217 194.329 20.1318 194.329 16.4938C194.329 11.9613 193.494 9.69507 191.824 9.69507Z" fill="white" />
    <path d="M243.752 57.4653C244.528 57.4653 245.124 57.853 245.542 58.6283C245.959 59.4036 246.168 60.3876 246.168 61.5804C246.168 64.443 245.303 66.1427 243.573 66.6795C239.995 67.9319 236.059 68.6475 231.765 68.8264C230.632 73.8361 228.396 77.8616 225.056 80.9032C221.716 83.8851 217.929 85.3761 213.695 85.3761C210.116 85.3761 207.045 84.5113 204.481 82.7818C201.976 81.0523 200.067 78.7562 198.755 75.8936C197.443 73.0309 196.787 69.9298 196.787 66.59C196.787 62.0575 197.652 58.0319 199.381 54.5133C201.111 50.935 203.497 48.1618 206.538 46.1937C209.58 44.166 212.949 43.1522 216.647 43.1522C221.179 43.1522 224.817 44.7326 227.561 47.8934C230.364 50.9946 232.004 54.8413 232.481 59.4334C235.284 59.2545 238.623 58.6581 242.5 57.6443C242.977 57.525 243.395 57.4653 243.752 57.4653ZM214.41 75.8936C216.319 75.8936 217.959 75.1183 219.33 73.5677C220.762 72.0171 221.716 69.7807 222.193 66.8584C220.344 65.606 218.913 63.9659 217.899 61.9382C216.945 59.9105 216.468 57.7635 216.468 55.4973C216.468 54.5431 216.557 53.5889 216.736 52.6346H216.289C213.903 52.6346 211.906 53.7976 210.295 56.1235C208.745 58.3897 207.969 61.6102 207.969 65.7849C207.969 69.065 208.596 71.5698 209.848 73.2993C211.16 75.0288 212.681 75.8936 214.41 75.8936Z" fill="white" />
    <path d="M292.948 43.1522C296.228 43.1522 297.869 44.1958 297.869 46.2832C297.869 46.9988 297.63 47.9829 297.153 49.2353C292.322 60.5069 287.76 69.6017 283.466 76.5198C281.319 79.9192 279.381 82.2451 277.651 83.4975C275.922 84.7499 273.954 85.3761 271.747 85.3761C269.361 85.3761 267.572 84.4517 266.38 82.6029C265.246 80.7541 264.531 77.7126 264.233 73.4782C264.113 71.9276 263.994 69.6017 263.875 66.5005C262.026 71.6294 260.326 75.5656 258.776 78.3089C257.285 80.9927 255.794 82.8414 254.303 83.8553C252.871 84.8691 251.142 85.3761 249.114 85.3761C246.669 85.3761 244.731 84.4219 243.299 82.5134C241.928 80.605 241.063 77.5933 240.705 73.4782C239.99 65.1289 239.632 57.8232 239.632 51.5612V48.4301C239.691 46.4024 240.198 45.0308 241.153 44.3151C242.107 43.5398 243.657 43.1522 245.804 43.1522C247.355 43.1522 248.488 43.51 249.204 44.2256C249.979 44.8817 250.367 46.0148 250.367 47.625C250.367 54.4834 250.784 63.3994 251.619 74.3728C253.587 70.1981 255.406 66.2024 257.076 62.3855C258.746 58.5687 260.684 53.6783 262.891 47.7145C263.547 45.9253 264.322 44.7326 265.217 44.1362C266.171 43.4802 267.274 43.1522 268.526 43.1522C270.196 43.1522 271.449 43.51 272.284 44.2256C273.119 44.8817 273.536 46.0148 273.536 47.625V61.4909C273.536 67.4548 273.566 71.7487 273.626 74.3728C276.369 69.6017 278.605 65.4569 280.335 61.9382C282.124 58.4196 284.122 53.6783 286.329 47.7145C286.985 45.9253 287.849 44.7326 288.923 44.1362C289.996 43.4802 291.338 43.1522 292.948 43.1522Z" fill="white" />
    <path d="M305.116 85.3761C302.492 85.3761 300.494 84.6604 299.122 83.2291C297.81 81.7978 297.154 79.9192 297.154 77.5933C297.154 74.9096 297.9 72.7626 299.391 71.1523C300.941 69.5421 303.088 68.737 305.832 68.737C308.456 68.737 310.424 69.393 311.736 70.7051C313.108 71.9575 313.793 73.8361 313.793 76.3409C313.793 79.0842 313.018 81.2908 311.467 82.9607C309.917 84.571 307.8 85.3761 305.116 85.3761ZM308.247 59.8807C305.623 59.8807 303.625 59.165 302.253 57.7337C300.941 56.3024 300.285 54.4238 300.285 52.0979C300.285 49.4142 301.031 47.2672 302.522 45.657C304.072 44.0467 306.219 43.2416 308.963 43.2416C311.587 43.2416 313.555 43.8976 314.867 45.2097C316.239 46.4621 316.924 48.3407 316.924 50.8455C316.924 53.5889 316.149 55.7955 314.598 57.4653C313.048 59.0756 310.931 59.8807 308.247 59.8807Z" fill="white" />
    <path d="M369.511 57.4653C370.286 57.4653 370.882 57.853 371.3 58.6283C371.717 59.4036 371.926 60.3876 371.926 61.5804C371.926 63.0714 371.717 64.2343 371.3 65.0692C370.882 65.8445 370.226 66.3813 369.332 66.6795C365.753 67.9319 361.817 68.6475 357.523 68.8264C356.331 73.7764 354.064 77.7722 350.725 80.8137C347.445 83.8553 343.807 85.3761 339.811 85.3761C333.787 85.3761 329.404 83.08 326.661 78.4878C323.917 73.8957 322.546 67.246 322.546 58.5388C322.546 50.8455 323.5 42.4961 325.408 33.4907C327.317 24.4257 330.09 16.7324 333.728 10.4107C337.425 4.02942 341.809 0.838776 346.878 0.838776C349.621 0.838776 351.828 2.03154 353.498 4.41708C355.168 6.74297 356.003 9.78452 356.003 13.5417C356.003 18.4321 355.078 23.2926 353.229 28.1233C351.381 32.954 348.309 38.0233 344.015 43.3311C348.011 43.6293 351.261 45.2991 353.766 48.3407C356.271 51.3226 357.762 55.0202 358.239 59.4334C361.042 59.2545 364.382 58.6581 368.258 57.6443C368.616 57.525 369.034 57.4653 369.511 57.4653ZM344.82 9.69507C343.628 9.69507 342.316 11.4842 340.884 15.0625C339.513 18.5812 338.23 23.3821 337.038 29.4652C335.845 35.5483 334.95 42.1979 334.354 49.4142C338.29 42.1979 341.421 35.8465 343.747 30.3597C346.132 24.8134 347.325 19.8932 347.325 15.5993C347.325 13.6908 347.087 12.2297 346.61 11.2158C346.192 10.202 345.596 9.69507 344.82 9.69507ZM340.169 75.8936C342.017 75.8936 343.657 75.1183 345.089 73.5677C346.52 72.0171 347.474 69.7807 347.951 66.8584C346.103 65.606 344.671 63.9659 343.657 61.9382C342.703 59.9105 342.226 57.7635 342.226 55.4973C342.226 54.6623 342.345 53.5292 342.584 52.0979H342.316C339.87 52.0979 337.813 53.3205 336.143 55.7657C334.533 58.1512 333.728 61.3717 333.728 65.4271C333.728 68.8264 334.354 71.4207 335.606 73.2099C336.918 74.999 338.439 75.8936 340.169 75.8936Z" fill="white" />
    <path d="M375.921 37.3374C373.416 37.3374 371.537 36.7709 370.285 35.6377C369.033 34.445 368.406 32.8049 368.406 30.7176C368.406 28.6302 369.212 26.9007 370.822 25.529C372.492 24.0977 374.549 23.3821 376.994 23.3821C379.201 23.3821 380.99 23.9188 382.362 24.9923C383.733 26.0658 384.419 27.5866 384.419 29.5546C384.419 31.9402 383.644 33.8486 382.093 35.2799C380.543 36.6516 378.485 37.3374 375.921 37.3374ZM375.205 85.3761C371.329 85.3761 368.496 84.0044 366.707 81.261C364.977 78.5177 364.112 74.8797 364.112 70.3472C364.112 67.6635 364.44 64.2343 365.096 60.0596C365.812 55.8253 366.707 51.8892 367.78 48.2512C368.317 46.3428 369.033 45.0308 369.927 44.3151C370.822 43.5994 372.253 43.2416 374.221 43.2416C377.263 43.2416 378.784 44.2555 378.784 46.2832C378.784 47.7741 378.217 51.2331 377.084 56.6602C375.652 63.2204 374.937 67.6635 374.937 69.9894C374.937 71.7785 375.175 73.1502 375.652 74.1044C376.13 75.0586 376.935 75.5358 378.068 75.5358C379.141 75.5358 380.483 74.7903 382.093 73.2993C383.704 71.8084 385.851 69.4526 388.534 66.2322C389.25 65.3972 390.055 64.9798 390.95 64.9798C391.725 64.9798 392.321 65.3376 392.739 66.0533C393.216 66.7689 393.455 67.753 393.455 69.0054C393.455 71.3909 392.888 73.2397 391.755 74.5517C385.851 81.768 380.334 85.3761 375.205 85.3761Z" fill="white" />
    <path d="M400.977 51.7401C400.858 54.722 400.798 57.0479 400.798 58.7178C400.798 63.0117 401.007 66.3813 401.425 68.8264C401.902 71.212 402.647 72.9415 403.661 74.015C404.735 75.0288 406.196 75.5358 408.044 75.5358C408.999 75.5358 410.132 75.2376 411.444 74.6412C412.756 74.0448 413.949 73.2695 415.022 72.3153C415.678 71.7189 416.334 71.4207 416.99 71.4207C417.706 71.4207 418.272 71.8382 418.69 72.6731C419.167 73.4484 419.406 74.4026 419.406 75.5358C419.406 76.6689 419.167 77.7722 418.69 78.8457C418.272 79.9192 417.616 80.8137 416.722 81.5294C413.621 84.0938 410.102 85.3761 406.166 85.3761C400.5 85.3761 396.355 83.0204 393.731 78.3089C391.107 73.5379 389.795 67.3355 389.795 59.7018C389.795 57.0777 389.885 54.4238 390.064 51.7401H386.575C384.786 51.7401 383.563 51.4121 382.907 50.756C382.311 50.1 382.012 49.0564 382.012 47.625C382.012 44.2853 383.354 42.6154 386.038 42.6154H391.137C392.151 36.0552 393.701 30.0615 395.789 24.6345C397.876 19.2074 400.381 14.8836 403.303 11.6631C406.285 8.44266 409.476 6.83243 412.875 6.83243C415.38 6.83243 417.348 7.93574 418.779 10.1424C420.211 12.349 420.926 15.1222 420.926 18.4619C420.926 27.7058 417.05 35.757 409.297 42.6154H419.316C420.27 42.6154 420.956 42.8241 421.374 43.2416C421.791 43.6591 422 44.4344 422 45.5675C422 49.6826 418.63 51.7401 411.891 51.7401H400.977ZM410.46 15.4203C409.565 15.4203 408.551 16.5535 407.418 18.8197C406.345 21.0263 405.301 24.1275 404.287 28.1233C403.333 32.0594 402.528 36.4428 401.872 41.2735C405.391 38.232 408.015 34.8326 409.744 31.0754C411.533 27.2585 412.428 23.7995 412.428 20.6983C412.428 17.1797 411.772 15.4203 410.46 15.4203Z" fill="white" />
  </svg>
  ,
  logging: new NullLogging(),
  compliance: {
    ConsentProvider: ({ children }: { children: ReactNode }) => (
      <stubConsentContext.Provider value={stubConsentValue}>
        {children}
      </stubConsentContext.Provider>
    ),
    consentContext: stubConsentContext,
    manageCookies: undefined,
  },
});

export default defaultDeploymentFactory;
