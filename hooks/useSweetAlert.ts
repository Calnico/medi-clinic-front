// hooks/useSweetAlert.ts
import { useCallback } from 'react'
import Swal from 'sweetalert2'

export const useSweetAlert = () => {
  // Configuración base para todas las alertas
  const baseConfig = {
    customClass: {
      popup: 'rounded-lg shadow-2xl',
      title: 'text-xl font-semibold text-gray-800',
      content: 'text-gray-600',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200',
      cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 mr-2',
      denyButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
    },
    buttonsStyling: false,
    showClass: {
      popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp animate__faster'
    }
  }

  // Alerta de éxito
  const showSuccess = useCallback((title: string, message?: string, timer: number = 3000) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'success',
      title,
      text: message,
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: false,
      customClass: {
        ...baseConfig.customClass,
        popup: 'rounded-lg shadow-2xl border-l-4 border-green-500'
      }
    })
  }, [])

  // Alerta de error
  const showError = useCallback((title: string, message?: string) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Entendido',
      customClass: {
        ...baseConfig.customClass,
        popup: 'rounded-lg shadow-2xl border-l-4 border-red-500',
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
      }
    })
  }, [])

  // Alerta de advertencia
  const showWarning = useCallback((title: string, message?: string) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Entendido',
      customClass: {
        ...baseConfig.customClass,
        popup: 'rounded-lg shadow-2xl border-l-4 border-yellow-500',
        confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
      }
    })
  }, [])

  // Alerta de información
  const showInfo = useCallback((title: string, message?: string) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'Entendido',
      customClass: {
        ...baseConfig.customClass,
        popup: 'rounded-lg shadow-2xl border-l-4 border-blue-500'
      }
    })
  }, [])

  // Alerta de confirmación
  const showConfirmation = useCallback((
    title: string, 
    message?: string, 
    confirmText: string = 'Sí, confirmar',
    cancelText: string = 'Cancelar'
  ) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'question',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      customClass: {
        ...baseConfig.customClass,
        popup: 'rounded-lg shadow-2xl border-l-4 border-purple-500'
      }
    })
  }, [])

  // Alerta de eliminación
  const showDeleteConfirmation = useCallback((
    itemName: string = 'este elemento',
    title?: string
  ) => {
    return Swal.fire({
      ...baseConfig,
      icon: 'warning',
      title: title || '¿Estás seguro?',
      html: `Esta acción eliminará <strong>${itemName}</strong> permanentemente.<br><span class="text-gray-500">Esta acción no se puede deshacer.</span>`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        ...baseConfig.customClass,
        popup: 'rounded-lg shadow-2xl border-l-4 border-red-500',
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
      }
    })
  }, [])

  // Alerta de carga/procesamiento
  const showLoading = useCallback((title: string = 'Procesando...', message?: string) => {
    Swal.fire({
      title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-lg shadow-2xl'
      },
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }, [])

  // Cerrar alerta
  const close = useCallback(() => {
    Swal.close()
  }, [])

  // Toast (notificación pequeña en esquina)
  const showToast = useCallback((
    icon: 'success' | 'error' | 'warning' | 'info',
    title: string,
    position: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start' = 'top-end',
    timer: number = 3000
  ) => {
    const Toast = Swal.mixin({
      toast: true,
      position,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      },
      customClass: {
        popup: 'rounded-lg shadow-lg border-l-4 ' + 
          (icon === 'success' ? 'border-green-500' :
           icon === 'error' ? 'border-red-500' :
           icon === 'warning' ? 'border-yellow-500' : 'border-blue-500')
      }
    })

    return Toast.fire({
      icon,
      title
    })
  }, [])

  // Alerta personalizada con HTML
  const showCustom = useCallback((config: any) => {
    return Swal.fire({
      ...baseConfig,
      ...config
    })
  }, [])

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    showDeleteConfirmation,
    showLoading,
    showToast,
    showCustom,
    close
  }
}