let GenerateQrAddressCode = function () {
    const QR = "_modal_payments_address"
    const ADDRESS_ID = '#_modal_payments_address'
    
    var qrcode = new QRCode(document.getElementById(QR), {
        text: $(ADDRESS_ID).text(),
	    width: 250,
	    height: 250,
	    colorDark : "#000000",
	    colorLight : "#ffffff",
	    correctLevel : QRCode.CorrectLevel.H
    })
}