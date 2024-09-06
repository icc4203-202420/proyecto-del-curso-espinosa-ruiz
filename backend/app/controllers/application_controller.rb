class ApplicationController < ActionController::API
  # Incluye los helpers de Devise para que 'authenticate_user!' esté disponible
  include Devise::Controllers::Helpers
  
  # Asegúrate de que Devise se active correctamente
  before_action :configure_permitted_parameters, if: :devise_controller?

  # Asegúrate de que las rutas protegidas requieran autenticación
  before_action :authenticate_user!, unless: :devise_controller?

  protected

  # Permitir parámetros personalizados para el registro y actualización de cuentas
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[first_name last_name handle avatar])
    devise_parameter_sanitizer.permit(:account_update, keys: %i[first_name last_name handle avatar])
  end
end
