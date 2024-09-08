class API::V1::RegistrationsController < Devise::RegistrationsController
  include ::RackSessionsFix
  respond_to :json

  private

  def sign_up_params
    params.require(:user).permit(
      :email, :first_name, :last_name, :handle,
      :password, :password_confirmation, address_attributes: [:line1, :line2, :city]
    )
  end

  def respond_with(current_user, _opts = {})
    if resource.persisted?
      token = request.env['warden-jwt_auth.token']  # Obtener el token JWT
      render json: {
        status: {code: 200, message: 'Signed up successfully.'},
        data: UserSerializer.new(current_user).serializable_hash[:data][:attributes],
        token: token  # Incluir el token en la respuesta
      }
    else
      render json: {
        status: {message: "User couldn't be created successfully. #{resource.errors.full_messages.to_sentence}"}
      }, status: :unprocessable_entity
    end
  end
end
  